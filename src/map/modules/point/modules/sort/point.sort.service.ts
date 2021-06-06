import { ForbiddenException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ERRORS } from '@rehuo/common/constants/error.constant';
import { RedisNames } from '@rehuo/common/constants/redis.constant';
import { DBNAME } from '@rehuo/common/constants/sql.constant';
import { DBService } from '@rehuo/common/db/db.service';
import { PageRequestDTO } from '@rehuo/common/dtos/page.request.dto';
import { PageResponseInternalDTO } from '@rehuo/common/dtos/page.response.dto';
import { UtilsService } from '@rehuo/common/providers/utils.service';
import { MapPointEntity } from '@rehuo/models/map.point.entity';
import { PointSaveEntity } from '@rehuo/models/point.save.entity';
import { PointSortEntity } from '@rehuo/models/point.sort.entity';
import { UserEntity } from '@rehuo/models/user.entity';
import { RedisService } from '@rehuo/redis/redis.service';
import { UserService } from '@rehuo/user/services/user.service';
import { DeleteResult, FindConditions, Repository } from 'typeorm';
import {
  PointSortCreateDTO,
  PointSortGetPointsDTO,
  PointSortUpdateByAuditorDTO,
  PointSortUpdateDTO,
} from './dtos/point.sort.crud.dto';

const msFields: any[] = ['sortId', 'name', 'userId', 'points'];

/**
 * queryBuild的查询和findOne的查询select输入格式不一样
 */
const msFieldsQuery: any[] = [
  `${DBNAME.POINT_SORTS}.sortId`,
  `${DBNAME.POINT_SORTS}.name`,
  `${DBNAME.POINT_SORTS}.logo`,
  `${DBNAME.POINT_SORTS}.userId`,
  `${DBNAME.POINT_SORTS}.points`,
];

@Injectable()
export class PointSortService extends DBService<PointSortEntity> {
  constructor(
    @InjectRepository(PointSortEntity)
    private ssRepo: Repository<PointSortEntity>,
    @InjectRepository(PointSaveEntity)
    private psRepo: Repository<PointSaveEntity>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => RedisService))
    private readonly redisService: RedisService,
  ) {
    super(ssRepo, PointSortService.name);
  }

  /**
   * 新建点位分类
   */
  async createOne(pointsort: PointSortCreateDTO): Promise<any> {
    const key = UtilsService.format(RedisNames.USER_ADD_SORT_LOCKED, pointsort.userId);
    if (!(await this.redisService.lock(key))) {
      return;
    }

    try {
      const sort = await this.findOneNotException(pointsort, ['sortId']);
      if (sort) {
        throw new ForbiddenException(ERRORS.POINTSORT_DUP);
      }
      return this.create(pointsort);
    } catch (err) {
      this.logger.error(err.message);
      throw err;
    } finally {
      await this.redisService.unlock(key);
    }
  }

  /**
   * 更新点位分类
   */
  async updateOne(
    findData: FindConditions<PointSortEntity>,
    pointsort: PointSortUpdateDTO | PointSortUpdateByAuditorDTO,
  ): Promise<any> {
    return this.update(findData, pointsort);
  }

  /**
   * 删除点位分类
   */
  async deleteOne(findData: FindConditions<PointSortEntity>): Promise<any> {
    const entity = await this.findOne(findData);
    if (entity.points > 0) {
      throw new ForbiddenException(ERRORS.RESOURCE_EXIST);
    }
    const result: DeleteResult = await this.ssRepo.delete(findData);
    if (result.affected) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * 根据用户ID获取点位所有分类
   */
  async getAll(
    findData: FindConditions<PointSortEntity>,
    pageDto: PageRequestDTO,
    fields: any[] = msFieldsQuery,
  ): Promise<any> {
    let where = `${DBNAME.POINT_SORTS}.userId = ${findData.userId}`;
    if (findData.cityCode) {
      where += ` and ${DBNAME.POINT_SORTS}.cityCode = ${findData.cityCode}`;
    }
    const queryBuilder = this.ssRepo.createQueryBuilder(DBNAME.POINT_SORTS);
    const [sorts, sortCounts] = await queryBuilder
      .where(where)
      .select(fields)
      .skip(pageDto.start)
      .take(pageDto.take)
      .orderBy(`${DBNAME.POINT_SORTS}.points`, pageDto.order)
      .addOrderBy(`${DBNAME.POINT_SORTS}.updatedAt`, pageDto.order)
      .getManyAndCount();

    let user: UserEntity;
    if (!findData.cityCode) {
      user = await this.userService.findOneNotException(
        {
          userId: findData.userId,
        },
        ['createPoints', 'savePoints', 'defaultCss'],
      );
    }

    const page = new PageResponseInternalDTO(pageDto.start, sorts.length, sortCounts);
    if (user) {
      return {
        sorts,
        page,
        totalPoints: user.createPoints + user.savePoints,
        defaultPoints: user.defaultCss,
      };
    } else {
      return {
        sorts,
        page,
      };
    }
  }

  /**
   * 根据用户ID和分类ID获取点位分类下的点位信息
   */
  async getPoints(gDto: PointSortGetPointsDTO): Promise<any> {
    const pointAlias = 'point',
      psaveAlias = 'save';
    const sortId =
      !gDto.hasOwnProperty('sortId') || gDto.sortId === undefined || gDto.sortId === null
        ? -1
        : Number(gDto.sortId);

    let where = `${psaveAlias}.userId = ${gDto.userId} `;
    sortId !== -1 ? (where += `and ${psaveAlias}.sortId = ${sortId} `) : null;

    if (gDto.hasOwnProperty('isNote')) {
      String(gDto.isNote) === 'true'
        ? (where += `and ${psaveAlias}.noteId != 0`)
        : (where += `and ${psaveAlias}.noteId = 0`);
    }

    const queryFields = [
      `${psaveAlias}.pointId`,
      `${psaveAlias}.name`,
      `${psaveAlias}.tag`,
      `${psaveAlias}.price`,
      `${psaveAlias}.sortId`,
      `${psaveAlias}.logo`,
      `${psaveAlias}.createdAt`,
      `${psaveAlias}.psaveId`,
      `${psaveAlias}.noteId`,
      `${pointAlias}.address`,
      `${pointAlias}.latitude`,
      `${pointAlias}.longitude`,
    ];

    const queryBuilder = this.psRepo.createQueryBuilder(psaveAlias);
    const [points, pointCounts]: [any, number] = await queryBuilder
      .innerJoinAndMapOne(
        `${psaveAlias}.point`,
        MapPointEntity,
        pointAlias,
        `${pointAlias}.pointId = ${psaveAlias}.pointId`,
      )
      .where(where)
      .select(queryFields)
      .skip(gDto.start)
      .take(gDto.take)
      .orderBy(`${psaveAlias}.psaveId`, gDto.order)
      .getManyAndCount();

    points.forEach(point => {
      Object.assign(point, point.point);
      delete point.point;
    });

    const page = new PageResponseInternalDTO(gDto.start, points.length, pointCounts);

    return {
      points,
      page,
    };
  }

  /**
   * 获取点位分类信息
   */
  async getOne(
    findData: FindConditions<PointSortEntity>,
    fields: any[] = msFields,
  ): Promise<PointSortEntity> {
    let user;
    if (Number(findData.sortId) <= 0) {
      user = await this.userService.findOne({ userId: findData.userId }, [
        'createPoints',
        'savePoints',
        'defaultCss',
      ]);
      const sort = new PointSortEntity();
      if (Number(findData.sortId) === 0) {
        sort.points = user.defaultCss;
        sort.name = '默认分类';
      } else {
        sort.points = user.createPoints + user.savePoints;
        sort.name = '全部点位';
      }
      sort.sortId = Number(findData.sortId);

      return sort;
    } else {
      return this.findOne(findData, fields);
    }
  }
}
