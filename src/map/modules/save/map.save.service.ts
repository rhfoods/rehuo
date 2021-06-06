import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { ERRORS } from '@rehuo/common/constants/error.constant';
import {
  MessageQueryTypes,
  MessageReturnTypes,
} from '@rehuo/common/constants/message.constant';
import { RedisNames } from '@rehuo/common/constants/redis.constant';
import { DBService } from '@rehuo/common/db/db.service';
import { PageRequestDTO } from '@rehuo/common/dtos/page.request.dto';
import { PageResponseInternalDTO } from '@rehuo/common/dtos/page.response.dto';
import { ISaveMessage } from '@rehuo/common/interfaces/message.interface';
import { UtilsService } from '@rehuo/common/providers/utils.service';
import { MessageService } from '@rehuo/message/message.service';
import { MapSaveEntity } from '@rehuo/models/map.save.entity';
import { PointSortEntity } from '@rehuo/models/point.sort.entity';
import { UserEntity } from '@rehuo/models/user.entity';
import { UserLinkEntity } from '@rehuo/models/user.link.entity';
import { RedisService } from '@rehuo/redis/redis.service';
import { Connection, FindConditions, Repository } from 'typeorm';
import { MapSaveCreateDTO, MapSaveDeleteDTO } from './dtos/map.save.crud.dto';

const msFields: any[] = ['createrId', 'userId'];

@Injectable()
export class MapSaveService extends DBService<MapSaveEntity> {
  constructor(
    @InjectRepository(MapSaveEntity)
    private msRepo: Repository<MapSaveEntity>,
    @Inject(forwardRef(() => MessageService))
    private msgService: MessageService,
    @Inject(forwardRef(() => RedisService))
    private redisService: RedisService,
    @InjectConnection()
    private readonly connection: Connection,
  ) {
    super(msRepo, MapSaveService.name);
  }

  /**
   * 新建地图收藏
   */
  async createOne(cDto: MapSaveCreateDTO): Promise<any> {
    const key = UtilsService.format(
      RedisNames.USER_ADD_MAP_LOCKED,
      cDto.userId,
      cDto.createrId,
    );
    if (cDto.createrId === cDto.userId) {
      throw new BadRequestException(ERRORS.PARAMS_INVALID);
    }

    try {
      if (!(await this.redisService.lock(key))) {
        return;
      }
      await this.connection.transaction('READ COMMITTED', async txEntityManager => {
        //查看createrId对应的整张地图是否被收藏
        const allMap = await txEntityManager.findOne(MapSaveEntity, {
          userId: cDto.userId,
          sortId: -1,
          createrId: cDto.createrId,
        });
        if (allMap) {
          throw new ForbiddenException(ERRORS.MAPSAVE_DUP);
        }

        //如果收藏整张地图，之前的分类地图将删除
        if (!cDto.hasOwnProperty('sortId') || cDto.sortId === -1) {
          const result = await txEntityManager.delete(MapSaveEntity, {
            userId: cDto.userId,
            createrId: cDto.createrId,
          });
          //对应地图数减少
          if (result.affected !== 0) {
            await txEntityManager.decrement(
              UserEntity,
              { userId: cDto.userId },
              'saveMaps',
              result.affected,
            );
          }
        }

        await txEntityManager.save(MapSaveEntity, cDto);

        //对应地图数加一
        await txEntityManager.increment(
          UserEntity,
          { userId: cDto.userId },
          'saveMaps',
          1,
        );

        //检查收藏者和被收藏者之间是否存在关联关系
        const userlink = await txEntityManager.findOne(
          UserLinkEntity,
          { userId: cDto.userId, followerId: cDto.createrId },
          { select: ['ulId'] },
        );
        if (!userlink) {
          const ul = new UserLinkEntity();
          ul.followerId = cDto.createrId;
          ul.userId = cDto.userId;
          await txEntityManager.save(ul);
        }
      });

      const message: ISaveMessage = {
        userId: cDto.userId,
        sortId: cDto.sortId ? cDto.sortId : -1,
        type: MessageReturnTypes.SAVE_MAP,
      };
      await this.msgService.message(cDto.createrId, message, MessageQueryTypes.SAVETOP);
    } catch (err) {
      const dupEntry = 'ER_DUP_ENTRY';
      Logger.error(err.message, MapSaveService.name);
      if (err.message.search(dupEntry) === 0) {
        throw new ForbiddenException(ERRORS.MAPSAVE_DUP);
      }
      throw err;
    } finally {
      await this.redisService.unlock(key);
    }
  }

  /**
   * 取消地图收藏
   */
  async deleteOne(dDto: MapSaveDeleteDTO): Promise<any> {
    if (!dDto.hasOwnProperty('sortId')) {
      dDto.sortId = -1;
    }
    const result = await this.msRepo.delete(dDto);
    if (result.affected !== 0) {
      //对应用户收藏的点位数加一
      await this.connection
        .getRepository(UserEntity)
        .decrement({ userId: dDto.userId }, 'saveMaps', 1);
    }
    if (result.affected === 0) {
      return false;
    } else {
      return true;
    }
  }

  /**
   * 获取地图收藏信息
   */
  async getOneNotException(
    findData: FindConditions<MapSaveEntity>,
    fields: any[] = msFields,
  ): Promise<any> {
    return this.findOneNotException(findData, fields);
  }

  /**
   * 分页获取地图收藏信息
   */
  async getAll(
    findData: FindConditions<MapSaveEntity>,
    pageDto: PageRequestDTO,
  ): Promise<any> {
    const msaveAlias = 'msave',
      userAlias = 'user',
      sortAlias = 'sort';
    const where = `${msaveAlias}.userId = ${findData.userId}`;
    const queryFields = [
      `${msaveAlias}.msaveId`,
      `${msaveAlias}.createrId`,
      `${msaveAlias}.sortId`,
      `${msaveAlias}.userId`,
      `${userAlias}.nickName`,
      `${userAlias}.avatarUrl`,
      `${userAlias}.createPoints`,
      `${userAlias}.savePoints`,
      `${userAlias}.defaultCss`,
      `${sortAlias}.name`,
      `${sortAlias}.points`,
    ];

    const queryBuilder = this.msRepo.createQueryBuilder(msaveAlias);
    const [msaves, msaveCounts]: [any, any] = await queryBuilder
      .innerJoinAndMapOne(
        `${msaveAlias}.user`,
        UserEntity,
        userAlias,
        `${userAlias}.userId = ${msaveAlias}.createrId`,
      )
      .leftJoinAndMapOne(
        `${msaveAlias}.sort`,
        PointSortEntity,
        sortAlias,
        `${sortAlias}.sortId = ${msaveAlias}.sortId`,
      )
      .select(queryFields)
      .skip(pageDto.start)
      .take(pageDto.take)
      .orderBy(`${msaveAlias}.msaveId`, pageDto.order)
      .where(where)
      .getManyAndCount();

    const page = new PageResponseInternalDTO(pageDto.start, msaves.length, msaveCounts);
    if (msaves.length === 0) {
      return {
        msaves,
        page,
      };
    }

    /**
     * 当收藏是地图分类时，需要返回的分类下数据进行重新赋值
     */
    msaves.forEach(msave => {
      Object.assign(msave, msave.user);
      Object.assign(msave, msave.ustat);
      if (msave.sort && msave.sort.name) {
        msave.sortName = msave.sort.name;
        msave.createPoints = msave.sort.points;
        msave.savePoints = 0;
      } else if (msave.sortId === -1) {
        msave.sortName = '所有的发现';
      } else {
        msave.sortName = '默认分类';
        msave.createPoints = msave.user.defaultCss;
        msave.savePoints = 0;
      }
      delete msave.user;
      delete msave.sort;
      delete msave.ustat;
    });

    return {
      msaves,
      page,
    };
  }
}
