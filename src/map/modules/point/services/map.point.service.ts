import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { ERRORS } from '@rehuo/common/constants/error.constant';
import { PointOwnTypes } from '@rehuo/common/constants/point.constant';
import { RedisNames } from '@rehuo/common/constants/redis.constant';
import { DBService } from '@rehuo/common/db/db.service';
import { UtilsService } from '@rehuo/common/providers/utils.service';
import { MapPointEntity } from '@rehuo/models/map.point.entity';
import { PointSaveEntity } from '@rehuo/models/point.save.entity';
import { PointSaveStatEntity } from '@rehuo/models/point.save.stat.entity';
import { PointSortEntity } from '@rehuo/models/point.sort.entity';
import { UserEntity } from '@rehuo/models/user.entity';
import { RedisService } from '@rehuo/redis/redis.service';
import { WechatService } from '@rehuo/shared/services/wechat.service';
import { Connection, FindConditions, Repository } from 'typeorm';
import { MapPointCreateDTO, MapPointUpdateDTO } from '../dtos/map.point.crud.dto';
import { PointSaveService } from '../modules/save/point.save.service';
import { PointSortService } from '../modules/sort/point.sort.service';
import { PointUtilsService } from './point.utils.service';

const msFields: any[] = ['pointId', 'longitude', 'latitude', 'address'];

@Injectable()
export class MapPointService extends DBService<MapPointEntity> {
  constructor(
    @InjectConnection()
    private readonly connection: Connection,
    @InjectRepository(MapPointEntity)
    private msRepo: Repository<MapPointEntity>,
    @Inject(forwardRef(() => PointSaveService))
    private readonly psaveService: PointSaveService,
    @Inject(forwardRef(() => PointSortService))
    private readonly psortService: PointSortService,
    @Inject(forwardRef(() => RedisService))
    private readonly redisService: RedisService,
    private readonly wechatService: WechatService,
  ) {
    super(msRepo, MapPointService.name);
  }

  /**
   * 新建点位
   */
  async createOne(cDto: MapPointCreateDTO): Promise<any> {
    const { name, userId, logo, sortId, tag, latitude, longitude, address, price } = cDto;
    const key = UtilsService.format(RedisNames.USER_ADD_POINT_LOCKED, userId);
    if (sortId > 0) {
      await this.psortService.getOne({ sortId }, ['sortId']);
    }
    try {
      let entity, pointsave;
      if (!(await this.redisService.lock(key))) {
        return;
      }

      const adcode = await this.wechatService.getPOI(cDto.latitude, cDto.longitude);
      if (!adcode) {
        throw new ForbiddenException(ERRORS.LBS_OUTOFREACH);
      }

      await this.connection.transaction('READ COMMITTED', async txEntityManager => {
        //查看是否存在可能相同的点位
        entity = await txEntityManager.findOne(MapPointEntity, {
          latitude,
          longitude,
        });
        if (!entity) {
          entity = await txEntityManager.findOne(MapPointEntity, { name, address });
        }

        if (!entity) {
          //创建点位
          const mappoint = new MapPointEntity();
          mappoint.latitude = latitude;
          mappoint.longitude = longitude;
          mappoint.name = name;
          mappoint.address = address;
          mappoint.code = adcode;
          entity = await txEntityManager.save(mappoint);
        } else {
          if (address !== entity.address && name !== entity.name) {
            await txEntityManager.update(
              MapPointEntity,
              { pointId: entity.pointId },
              { name, address },
            );
          }
        }

        //检查是否已经添加了对应点位
        const oldPoint = await txEntityManager.findOne(PointSaveEntity, {
          userId,
          pointId: entity.pointId,
        });
        if (oldPoint) {
          throw new ForbiddenException(ERRORS.MAPPOINT_DUP);
        }

        //创建点位收藏
        pointsave = new PointSaveEntity();
        pointsave.tag = tag;
        pointsave.pointId = entity.pointId;
        pointsave.logo = logo;
        pointsave.price = price;
        pointsave.sortId = sortId;
        pointsave.name = name;
        pointsave.userId = userId;
        pointsave.ownType = PointOwnTypes.MY_CREATE;
        const newsave = await txEntityManager.save(pointsave);
        await txEntityManager.update(
          PointSaveEntity,
          { psaveId: newsave.psaveId },
          { ffpsaveId: newsave.psaveId },
        );

        //仅新建点位才会存在对应统计数据
        const psaveStat = new PointSaveStatEntity();
        psaveStat.psaveId = newsave.psaveId;
        await txEntityManager.save(psaveStat);

        //对应分类的点位数加一
        if (sortId === 0) {
          await txEntityManager.increment(UserEntity, { userId }, 'defaultCss', 1);
        } else {
          await txEntityManager.increment(PointSortEntity, { sortId }, 'points', 1);
        }
        //对应用户创建的点位数加一
        await txEntityManager.increment(UserEntity, { userId }, 'createPoints', 1);
        await PointUtilsService.incrementPCP(txEntityManager, userId, adcode);
      });

      return Object.assign(entity, pointsave);
    } catch (err) {
      const dupEntry = 'ER_DUP_ENTRY';

      Logger.error(err.message, DBService.name);
      if (err.message.search(dupEntry) === 0) {
        throw new ForbiddenException(ERRORS.MAPPOINT_DUP);
      }
      throw err;
    } finally {
      await this.redisService.unlock(key);
    }
  }

  /**
   * 更新点位
   */
  async updateOne(
    findData: FindConditions<PointSaveEntity>,
    uDto: MapPointUpdateDTO,
  ): Promise<any> {
    const pointsave = await this.psaveService.getOne(findData, ['pointId', 'sortId']);

    const { name, logo, sortId, tag, latitude, longitude, address, price } = uDto;
    try {
      await this.connection.transaction('READ COMMITTED', async txEntityManager => {
        const updatePointSave: any = {};
        //如果更换分类
        if (uDto.hasOwnProperty('sortId')) {
          await PointUtilsService.updateBySortIdChanged(
            txEntityManager,
            Number(findData.userId),
            sortId,
            pointsave.sortId,
          );
          if (sortId != pointsave.sortId) {
            updatePointSave.sortId = sortId;
          }
        }

        //如果更新点位收藏信息
        if (logo || tag || price || name) {
          logo ? (updatePointSave.logo = logo) : null;
          tag ? (updatePointSave.tag = tag) : null;
          price ? (updatePointSave.price = price) : null;
          name ? (updatePointSave.name = name) : null;
        }
        if (Object.keys(updatePointSave).length > 0) {
          await txEntityManager.update(
            PointSaveEntity,
            { psaveId: findData.psaveId },
            updatePointSave,
          );
        }

        //如果更新点位信息
        if (latitude || longitude || address || name) {
          const update: any = {};
          latitude ? (update.latitude = latitude) : null;
          longitude ? (update.longitude = longitude) : null;
          address ? (update.address = address) : null;
          name ? (update.name = name) : null;
          if (Object.keys(update).length > 0) {
            await txEntityManager.update(
              MapPointEntity,
              { pointId: pointsave.pointId },
              update,
            );
          }
        }
      });
    } catch (err) {
      const dupEntry = 'ER_DUP_ENTRY';
      Logger.error(err.message, DBService.name);
      if (err.message.search(dupEntry) === 0) {
        throw new ForbiddenException(ERRORS.MAPPOINT_DUP);
      }
      throw err;
    }
  }

  /**
   * 获取点位信息
   */
  async getOne(
    findData: FindConditions<MapPointEntity>,
    fields: any[] = msFields,
  ): Promise<any> {
    return this.findOne(findData, fields);
  }
}
