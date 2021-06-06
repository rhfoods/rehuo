import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { ChinaCitys } from '@rehuo/common/constants/city.constant';
import { ERRORS } from '@rehuo/common/constants/error.constant';
import {
  MapAreaTypes,
  MapPointCounts,
  MapScopeTypes,
  MapShowScales,
  PUBLIC_MAP_USER_ID,
} from '@rehuo/common/constants/map.constant';
import { PointOwnTypes } from '@rehuo/common/constants/point.constant';
import { RedisNames, RedisTimeouts } from '@rehuo/common/constants/redis.constant';
import { SqlOrderTypes } from '@rehuo/common/constants/sql.constant';
import {
  WechatDataTypes,
  WechatMiniTypes,
} from '@rehuo/common/constants/wechat.constant';
import { ISmsParam } from '@rehuo/common/interfaces/sms.interface';
import { IWechatDataReq } from '@rehuo/common/interfaces/wechat.interface';
import { UtilsService } from '@rehuo/common/providers/utils.service';
import { CityPointEntity } from '@rehuo/models/city.point.entity';
import { MapPointEntity } from '@rehuo/models/map.point.entity';
import { PointNoteEntity } from '@rehuo/models/point.note.entity';
import { PointSaveEntity } from '@rehuo/models/point.save.entity';
import { PointSaveStatEntity } from '@rehuo/models/point.save.stat.entity';
import { PointSortEntity } from '@rehuo/models/point.sort.entity';
import { PublicCityEntity } from '@rehuo/models/public.city.entity';
import { UserEntity } from '@rehuo/models/user.entity';
import { UserPublicEntity } from '@rehuo/models/user.public.entity';
import { UserStatEntity } from '@rehuo/models/user.stat.entity';
import { RedisService } from '@rehuo/redis/redis.service';
import { SmsService } from '@rehuo/shared/services/sms.service';
import { WechatService } from '@rehuo/shared/services/wechat.service';
import { UserService } from '@rehuo/user/services/user.service';
import * as _ from 'lodash';
import { Connection, MoreThan, Not } from 'typeorm';
import {
  MapGetAreaDTO,
  MapGetDTO,
  MapGetScopeDTO,
  MapQrCodeCreateDTO,
  MapTransferDTO,
  PublicMapTransferDTO,
} from '../dtos/map.crud.dto';
import { PointNoteService } from '../modules/point/modules/note/services/point.note.service';
import { PointSortService } from '../modules/point/modules/sort/point.sort.service';
import { PointUtilsService } from '../modules/point/services/point.utils.service';
import { MapSaveService } from '../modules/save/map.save.service';
import { MapCacheService } from './map.cache.service';

interface IPointLocation {
  latitude: number;
  longitude: number;
}

@Injectable()
export class UserMapService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => PointSortService))
    private readonly psortService: PointSortService,
    @Inject(forwardRef(() => PointNoteService))
    private readonly pnoteService: PointNoteService,
    @Inject(forwardRef(() => RedisService))
    private readonly redisService: RedisService,
    private readonly wechatService: WechatService,
    private readonly smsService: SmsService,
    @Inject(forwardRef(() => MapSaveService))
    private readonly msaveSerive: MapSaveService,
    @InjectConnection()
    private readonly connection: Connection,
    private readonly mcacheService: MapCacheService,
  ) {}

  private latlongToLocation(latlong: string): IPointLocation {
    const location = latlong.split(',');
    return {
      latitude: parseFloat(location[0]),
      longitude: parseFloat(location[1]),
    };
  }

  private compareLocation(
    location: IPointLocation,
    rightCorner: IPointLocation,
    leftBottom: IPointLocation,
  ): boolean {
    return (
      location.latitude >= leftBottom.latitude &&
      location.latitude <= rightCorner.latitude &&
      location.longitude >= leftBottom.longitude &&
      location.longitude <= rightCorner.longitude
    );
  }

  /**
   * 检查该分类地图是否被收藏
   */
  private async isSaveMap(gDto: MapGetDTO | MapGetScopeDTO) {
    //检查该分类是否被收藏
    if (gDto.createrId && gDto.userId !== gDto.createrId) {
      const where = { userId: gDto.userId, createrId: gDto.createrId };
      const mapsaves = await this.msaveSerive.findAll(where, ['msaveId', 'sortId']);

      for (let i = 0; i < mapsaves.length; i++) {
        if (mapsaves[i].sortId === -1 || mapsaves[i].sortId === Number(gDto.sortId)) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * 获取用户所有点位信息
   */
  private async getByCreaterId(
    createrId: number,
    userId: number,
    sortId: number,
  ): Promise<any> {
    const pointAlias = 'point',
      psaveAlias = 'save',
      psaveStatAlias = 'stat';
    const QueryFields = [
      `${psaveAlias}.psaveId`,
      `${psaveAlias}.ffpsaveId`,
      `${psaveAlias}.pointId`,
      `${psaveAlias}.tag`,
      `${psaveAlias}.logo`,
      `${psaveAlias}.sortId`,
      `${psaveAlias}.isPassed`,
      `${pointAlias}.latitude`,
      `${pointAlias}.longitude`,
      `${psaveStatAlias}.goods`,
    ];

    let where;
    if (sortId >= 0) {
      where = `${psaveAlias}.userId = ${createrId} and ${psaveAlias}.sortId = ${sortId}`;
    } else {
      where = `${psaveAlias}.userId = ${createrId}`;
    }

    const points: any = await this.connection
      .createQueryBuilder(PointSaveEntity, psaveAlias)
      .innerJoinAndMapOne(
        `${psaveAlias}.point`,
        MapPointEntity,
        pointAlias,
        `${pointAlias}.pointId = ${psaveAlias}.pointId`,
      )
      .innerJoinAndMapOne(
        `${psaveAlias}.stat`,
        PointSaveStatEntity,
        psaveStatAlias,
        `${psaveStatAlias}.psaveId = ${psaveAlias}.ffpsaveId`,
      )
      .select(QueryFields)
      .where(where)
      .orderBy(`${psaveAlias}.psaveId`, SqlOrderTypes.ASC)
      .getMany();

    points.forEach(point => {
      Object.assign(point, point.point);
      Object.assign(point, point.stat);
      /**
       * 如果查看别人的地图, isPassed为false
       */
      if (userId !== Number(createrId)) {
        point.isPassed = false;
      }
      delete point.point;
      delete point.stat;
      delete point.pointId;
    });

    return points;
  }

  /**
   * 根据坐标和分类进行点位查找
   */
  private async getByLatLong(
    createrId: number,
    userId: number,
    totalPoints: number,
    rightCorner: IPointLocation,
    leftBottom: IPointLocation,
    sortId: number,
  ): Promise<any> {
    let mappoints, points;
    const pointAlias = 'point',
      psaveAlias = 'save',
      psaveStatAlias = 'stat';
    const QueryFields = [
      `${psaveAlias}.psaveId`,
      `${psaveAlias}.ffpsaveId`,
      `${psaveAlias}.pointId`,
      `${psaveAlias}.tag`,
      `${psaveAlias}.logo`,
      `${psaveAlias}.sortId`,
      `${psaveAlias}.isPassed`,
      `${pointAlias}.latitude`,
      `${pointAlias}.longitude`,
      `${psaveStatAlias}.goods`,
    ];

    let start = 0,
      i = 0,
      amount = totalPoints;
    const maxTake = MapPointCounts.MAX_ONETAKE * 10;
    let take = amount > maxTake ? maxTake : amount;
    let where;

    if (sortId >= 0) {
      where = `${psaveAlias}.userId = ${createrId} and ${psaveAlias}.sortId = ${sortId}`;
    } else {
      where = `${psaveAlias}.userId = ${createrId}`;
    }

    do {
      points = await this.connection
        .createQueryBuilder(PointSaveEntity, psaveAlias)
        .innerJoinAndMapOne(
          `${psaveAlias}.point`,
          MapPointEntity,
          pointAlias,
          `${pointAlias}.pointId = ${psaveAlias}.pointId`,
        )
        .innerJoinAndMapOne(
          `${psaveAlias}.stat`,
          PointSaveStatEntity,
          psaveStatAlias,
          `${psaveStatAlias}.psaveId = ${psaveAlias}.ffpsaveId`,
        )
        .skip(start)
        .select(QueryFields)
        .where(where)
        .take(take)
        .orderBy(`${psaveAlias}.psaveId`, SqlOrderTypes.ASC)
        .getMany();

      if (points.length === 0) {
        return [];
      }
      mappoints = points.filter(point => {
        const location: IPointLocation = {
          latitude: point.point.latitude,
          longitude: point.point.longitude,
        };
        return this.compareLocation(location, rightCorner, leftBottom);
      });

      mappoints.forEach(point => {
        Object.assign(point, point.point);
        Object.assign(point, point.stat);
        /**
         * 如果查看别人的地图, isPassed为false
         */
        if (userId !== Number(createrId)) {
          point.isPassed = false;
        }
        delete point.point;
        delete point.stat;
        delete point.pointId;
      });
      if (mappoints.length >= MapPointCounts.MAX_ONETAKE || take <= maxTake) {
        break;
      }

      i++;
      start = take * i;
      amount = amount - start;
      take = amount > maxTake ? maxTake : amount;
    } while (take);

    if (mappoints.length <= MapPointCounts.MAX_ONETAKE) {
      return mappoints;
    } else if (
      mappoints.length > MapPointCounts.MAX_ONETAKE &&
      mappoints.length <= Math.round(MapPointCounts.MAX_ONETAKE * 1.5)
    ) {
      mappoints = _.shuffle(mappoints);
      return mappoints.slice(0, MapPointCounts.MAX_ONETAKE);
    } else {
      const indexs = UtilsService.randomIndex(
        mappoints.length,
        MapPointCounts.MAX_ONETAKE,
      );
      const newPoints = [];
      indexs.forEach(index => {
        newPoints.push(mappoints[index]);
      });
      return newPoints;
    }
  }

  /**
   * 进行数据迁移
   * 用户A某个分类的数据迁移给用户B
   * @notes 本迁移不能处理相同点位，意思是A和B都存在同一点位，A迁移到B
   */
  private async userTranfer(
    providerId: number,
    userId: number,
    adcode?: string,
  ): Promise<boolean> {
    //检查对应用户是否存在
    const provider = await this.userService.findOne({ userId: providerId }, [
      'userId',
      'createPoints',
      'defaultCss',
    ]);
    const user =
      userId !== PUBLIC_MAP_USER_ID
        ? await this.userService.findOne({ userId }, ['createPoints', 'defaultCss'])
        : null;

    let whereUser: any = { userId };
    adcode ? (whereUser.cityCode = adcode) : null;

    //检查分类是否存在
    const srcSorts = await this.psortService.findAll({ userId: providerId }, [
      'sortId',
      'name',
      'points',
    ]);

    //检查目标用户是否具有对应命名的分类
    const dstSorts = await this.psortService.findAll(whereUser, [
      'sortId',
      'name',
      'points',
    ]);

    const providerSorts = [];
    srcSorts.forEach(sort => {
      providerSorts.push({
        sortId: sort.sortId,
        points: sort.points,
      });
    });

    let sameSorts = [],
      diffSorts = [];

    //比较两个用户的分类交集和差集
    if (dstSorts.length === 0) {
      diffSorts = srcSorts;
    } else if (srcSorts.length === 0) {
      sameSorts = dstSorts;
    } else {
      const indexes = [];
      for (let i = 0; i < srcSorts.length; i++) {
        for (let j = 0; j < dstSorts.length; j++) {
          if (srcSorts[i].name === dstSorts[j].name) {
            sameSorts.push({
              srcSortId: srcSorts[i].sortId,
              dstSortId: dstSorts[j].sortId,
              points: srcSorts[i].points + dstSorts[j].points,
            });
            indexes.push(i);
          }
        }
      }
      srcSorts.forEach((sort, index) => {
        indexes.includes(index) ? null : diffSorts.push(sort);
      });
    }

    const key = UtilsService.format(RedisNames.TRANSFER_LOCKED);
    try {
      if (!(await this.redisService.lock(key))) {
        return;
      }
      let createPoints = 0,
        defaultCss = 0;
      await this.connection.transaction('READ COMMITTED', async txEntityManager => {
        //迁移存在相同分类的数据
        for (let i = 0; i < sameSorts.length; i++) {
          await txEntityManager.update(
            PointSortEntity,
            { sortId: sameSorts[i].dstSortId },
            { points: sameSorts[i].points },
          );
          const result = await txEntityManager.update(
            PointSaveEntity,
            {
              userId: providerId,
              sortId: sameSorts[i].srcSortId,
              ownType: PointOwnTypes.MY_CREATE,
              deletedAt: null,
            },
            { userId, sortId: sameSorts[i].dstSortId },
          );
          createPoints += result.affected;

          await txEntityManager.delete(PointSortEntity, {
            sortId: sameSorts[i].srcSortId,
          });
        }
        //迁移存在不同分类的数据
        for (let i = 0; i < diffSorts.length; i++) {
          let updateData: any = {
            userId,
          };
          if (adcode) {
            updateData.cityCode = adcode;
            updateData.logo = 'moren.png';
          }

          await txEntityManager.update(
            PointSortEntity,
            { sortId: diffSorts[i].sortId, userId: providerId },
            updateData,
          );
          const result = await txEntityManager.update(
            PointSaveEntity,
            {
              userId: providerId,
              sortId: diffSorts[i].sortId,
              ownType: PointOwnTypes.MY_CREATE,
              deletedAt: null,
            },
            { userId },
          );
          createPoints += result.affected;
        }

        const result = await txEntityManager.update(
          PointSaveEntity,
          {
            userId: providerId,
            sortId: 0,
            ownType: PointOwnTypes.MY_CREATE,
            deletedAt: null,
          },
          { userId },
        );
        defaultCss += result.affected;
        createPoints += result.affected;

        const uStat = await txEntityManager.findOne(
          UserStatEntity,
          { userId: providerId },
          { select: ['noteViews', 'noteTops', 'noteLikes'] },
        );

        await txEntityManager.update(
          UserStatEntity,
          { userId: providerId },
          { noteViews: 0, noteTops: 0, noteLikes: 0 },
        );
        await txEntityManager.update(
          UserStatEntity,
          { userId },
          {
            noteViews: uStat.noteViews,
            noteTops: uStat.noteTops,
            noteLikes: uStat.noteLikes,
          },
        );
        if (user) {
          await txEntityManager.update(
            UserEntity,
            { userId },
            {
              createPoints: user.createPoints + createPoints,
              defaultCss: user.defaultCss + defaultCss,
            },
          );
        }

        await txEntityManager.update(
          UserEntity,
          { userId: providerId },
          {
            createPoints: provider.createPoints - createPoints,
            defaultCss: provider.defaultCss - defaultCss,
          },
        );

        //迁移统计数据
        await PointUtilsService.transferPCP(txEntityManager, providerId, userId);

        //迁移文章
        const psaves = await txEntityManager.find(PointSaveEntity, {
          where: { userId },
          select: ['psaveId'],
        });

        for (let i = 0; i < psaves.length; i++) {
          const updateNote: any = { userId };
          if (adcode) {
            updateNote.isAudit = true;
          }
          await txEntityManager.update(
            PointNoteEntity,
            { psaveId: psaves[i].psaveId, userId: providerId },
            updateNote,
          );
          const notes = await txEntityManager.find(PointNoteEntity, {
            where: { psaveId: psaves[i].psaveId, userId },
            select: ['noteId'],
          });

          for (let i = 0; i < notes.length; i++) {
            await this.pnoteService.uncache(notes[i].noteId);
          }
        }

        //写入公共地图城市信息
        if (adcode) {
          const city = await txEntityManager.findOne(PublicCityEntity, {
            where: { code: adcode },
            select: ['pcId'],
          });
          if (!city) {
            const newCity = {
              code: adcode,
            };
            await txEntityManager.save(PublicCityEntity, newCity);
          }

          const toPublic = new UserPublicEntity();
          toPublic.code = adcode;
          toPublic.providerId = providerId;
          await txEntityManager.save(toPublic);
        }
      });

      return true;
    } catch (err) {
      Logger.error(err.message, UserMapService.name);
      throw new ForbiddenException(ERRORS.TRANSFER_EXCEPTION);
    } finally {
      await this.redisService.unlock(key);
    }
  }

  /**
   * 根据用户ID获取地图信息
   */
  async get(gDto: MapGetDTO): Promise<any> {
    const user: UserEntity = await this.userService.findOneNotException(
      {
        userId: gDto.createrId,
      },
      ['createPoints', 'savePoints', 'defaultCss'],
    );
    let points;
    let result: any;
    let totalPoints;

    if (!user) {
      return {
        points: [],
        totalPoints: 0,
      };
    }

    //获取对应分类的点位数
    if (gDto.sortId > 0) {
      const sort = await this.psortService.getOne({ sortId: gDto.sortId }, ['points']);
      totalPoints = sort.points;
    } else if (gDto.sortId === -1) {
      totalPoints = user.createPoints + user.savePoints;
    } else {
      totalPoints = user.defaultCss;
    }

    //根据点位的数量确定是否进行坐标分类
    if (totalPoints <= MapPointCounts.MAX_ONETAKE) {
      points = await this.getByCreaterId(gDto.createrId, gDto.userId, gDto.sortId);
      result = {
        totalPoints,
        points,
      };
    } else {
      if (gDto.rightCorner && gDto.leftBottom) {
        const rightCorner = this.latlongToLocation(gDto.rightCorner);
        const leftBottom = this.latlongToLocation(gDto.leftBottom);

        points = await this.getByLatLong(
          gDto.createrId,
          gDto.userId,
          totalPoints,
          rightCorner,
          leftBottom,
          gDto.sortId,
        );
      } else {
        points = await this.getByCreaterId(gDto.createrId, gDto.userId, gDto.sortId);
      }
      result = {
        points,
        totalPoints,
      };
    }

    //检查该分类是否被收藏
    result.isSaved = await this.isSaveMap(gDto);

    return result;
  }

  /**
   * 根据用户请求生成小程序码
   */
  async createQrCode(cDto: MapQrCodeCreateDTO): Promise<any> {
    const type = cDto.scene.type;
    if (type === WechatDataTypes.TRANSFER) {
      const key = UtilsService.format(
        RedisNames.QRCODE_TRANSFER,
        cDto.scene.transfer.userId,
      );

      await this.checkNotCreatePointCount(cDto.scene.transfer.userId);

      await this.redisService.unsave(key);
      await this.redisService.save(
        key,
        cDto.scene.transfer.phone,
        RedisTimeouts.QRCODE_TRANSFER,
      );
    }

    return {
      qrCode: await this.wechatService.wxacode({ code: WechatMiniTypes.USER, ...cDto }),
    };
  }

  /**
   * 检查小程序码是否有效
   */
  async checkQrCode(scene: string): Promise<any> {
    const wxReq: IWechatDataReq = this.wechatService.decodeScene(scene);
    if (wxReq.type === WechatDataTypes.TRANSFER) {
      const key = UtilsService.format(RedisNames.QRCODE_TRANSFER, wxReq.transfer.userId);
      const phone = await this.redisService.get(key);
      if (!phone || phone !== wxReq.transfer.phone) {
        throw new ForbiddenException(ERRORS.TRANSFER_WXCODE_INVALID);
      }
      return true;
    }
    return true;
  }

  /**
   * 执行迁移操作
   */
  async transfer(cDto: MapTransferDTO): Promise<boolean> {
    const keyTransfer = UtilsService.format(RedisNames.QRCODE_TRANSFER, cDto.providerId);
    const transfer = await this.redisService.get(keyTransfer);

    if (!transfer) {
      throw new ForbiddenException(ERRORS.TRANSFER_EXPIRED);
    }

    if (transfer !== cDto.phone) {
      throw new ForbiddenException(ERRORS.TRANSFER_PHONE_INVALID);
    }

    await this.checkNotCreatePointCount(cDto.providerId);

    const keyPhone = UtilsService.format(
      RedisNames.TRANSFER_PHONE,
      cDto.phone,
      cDto.userId,
    );
    const authCode = await this.redisService.get(keyPhone);
    const sms: ISmsParam = {
      PhoneNumbers: cDto.phone,
      SmsData: { code: cDto.smsCode },
    };
    let isSucceed = await this.smsService.verify(sms, authCode);
    if (isSucceed) {
      const sames = await this.checkoutTransferPointSame(cDto.providerId, cDto.userId);
      if (sames.length !== 0) {
        throw new ForbiddenException({ ...ERRORS.TRANSFER_POINT_SAME, extraMsg: sames });
      }
      isSucceed = await this.userTranfer(cDto.providerId, cDto.userId);
      if (isSucceed) {
        await this.redisService.unsave(keyTransfer);
        await this.redisService.unsave(keyPhone);
      }
    }

    return isSucceed;
  }

  /**
   * 获取城市信息
   */
  private async getCitys(
    citys: any[],
    gDto: MapGetScopeDTO | MapGetAreaDTO,
  ): Promise<any> {
    const sortId = Number(gDto.sortId);
    let newCitys;
    if (sortId === -1) {
      citys.forEach(city => {
        try {
          const { cCode } = PointUtilsService.formatAdcode(city.code);
          const { name, latlng } = ChinaCitys['C' + cCode];
          city.name = name;
          city.latlng = latlng;
          city.scale = UtilsService.getCityScale(city.code);
        } catch (err) {
          Logger.error(`${city.code} don't find match city`, MapSaveService.name);
        }
      });
    } else {
      const psaveAlias = 'psave',
        pointAlias = 'point';

      for (let i = 0; i < citys.length; i++) {
        let CODE = 'C';
        try {
          const { cCode, fCode } = PointUtilsService.formatAdcode(citys[i].code);
          CODE += cCode;
          const { name, latlng } = ChinaCitys[CODE];
          citys[i].name = name;
          citys[i].latlng = latlng;
          citys[i].scale = UtilsService.getCityScale(citys[i].code);

          /**
           * 重新计算分类的点位数量
           */
          const where = `${psaveAlias}.userId = ${gDto.createrId} and ${psaveAlias}.sortId = ${sortId}`;
          citys[i].counts = await this.connection
            .createQueryBuilder(PointSaveEntity, psaveAlias)
            .innerJoinAndMapOne(
              `${psaveAlias}.point`,
              MapPointEntity,
              pointAlias,
              `${pointAlias}.pointId = ${psaveAlias}.pointId and ${pointAlias}.code like '${fCode}%'`,
            )
            .where(where)
            .getCount();
        } catch (err) {
          Logger.error(`${CODE} don't find match city`, MapSaveService.name);
        }
      }
      newCitys = citys.filter(elem => elem.counts > 0);
    }
    return {
      type: MapScopeTypes.CITYS,
      maps: newCitys ? newCitys : citys,
    };
  }

  /**
   * 获取点位信息
   */
  private async getPoints(
    gDto: MapGetScopeDTO | MapGetAreaDTO,
    adcode: string,
  ): Promise<any> {
    const { cCode, fCode } = PointUtilsService.formatAdcode(adcode);

    const pointAlias = 'point',
      psaveAlias = 'save',
      psaveStatAlias = 'stat';
    const QueryFields = [
      `${psaveAlias}.psaveId`,
      `${psaveAlias}.ffpsaveId`,
      `${psaveAlias}.pointId`,
      `${psaveAlias}.tag`,
      `${psaveAlias}.logo`,
      `${psaveAlias}.sortId`,
      `${psaveAlias}.isPassed`,
      `${pointAlias}.latitude`,
      `${pointAlias}.longitude`,
      `${pointAlias}.code`,
      `${psaveStatAlias}.goods`,
    ];

    let where = `${psaveAlias}.userId = ${gDto.createrId}`,
      whereCode = `${pointAlias}.pointId = ${psaveAlias}.pointId and ${pointAlias}.code like '${fCode}%'`;
    if (Number(gDto.sortId) >= 0) {
      where += ` and ${psaveAlias}.sortId = ${gDto.sortId}`;
    }

    const points: any = await this.connection
      .createQueryBuilder(PointSaveEntity, psaveAlias)
      .innerJoinAndMapOne(`${psaveAlias}.point`, MapPointEntity, pointAlias, whereCode)
      .innerJoinAndMapOne(
        `${psaveAlias}.stat`,
        PointSaveStatEntity,
        psaveStatAlias,
        `${psaveStatAlias}.psaveId = ${psaveAlias}.ffpsaveId`,
      )
      .select(QueryFields)
      .where(where)
      .orderBy(`${psaveAlias}.psaveId`, SqlOrderTypes.ASC)
      .getMany();

    points.forEach(point => {
      Object.assign(point, point.point);
      Object.assign(point, point.stat);
      /**
       * 如果查看别人的地图, isPassed为false
       */
      if (gDto instanceof MapGetScopeDTO && gDto.userId !== Number(gDto.createrId)) {
        point.isPassed = false;
      }
      delete point.point;
      delete point.stat;
      delete point.pointId;
    });

    return {
      type: MapScopeTypes.POINTS,
      points,
      scale: UtilsService.getCityScale(cCode),
    };
  }

  /**
   * 获取地图或者点位信息
   */
  private async getByMap(gDto: MapGetScopeDTO): Promise<any> {
    /**
     * 如果当前城市没有点位则查找其它城市
     */
    const citys = await this.connection.getRepository(CityPointEntity).find({
      where: {
        userId: gDto.createrId,
        counts: MoreThan(0),
      },
      select: ['code', 'counts'],
    });

    const { cCode } = PointUtilsService.formatAdcode(gDto.code);
    const scale = UtilsService.getCityScale(cCode);
    const finded = citys.find(city => city.code === cCode);

    if (finded && Number(gDto.scale) >= scale) {
      const result = await this.getPoints(gDto, finded.code);
      /**
       * 如果对应分类没有点位，则返回城市信息
       */
      if (result.points.length === 0) {
        return this.getCitys(citys, gDto);
      } else {
        return result;
      }
    } else {
      return this.getCitys(citys, gDto);
    }
  }

  /**
   * 返回地图信息，包括各省、各市和各区市县信息
   */
  async getScope(gDto: MapGetScopeDTO): Promise<any> {
    let result: any = await this.getByMap(gDto);

    //检查该分类是否被收藏
    if (gDto.createrId !== 0) {
      result.isSaved = await this.isSaveMap(gDto);
    } else {
      result.isSaved = false;
    }

    return result;
  }

  /**
   * 返回地图信息，包括各省、各市和各区市县信息
   */
  async getArea(gDto: MapGetAreaDTO): Promise<any> {
    let result: any = {};

    switch (gDto.type) {
      case MapAreaTypes.CITYS:
        result = await this.getPoints(gDto, gDto.code);
        break;

      default:
    }

    result.isSaved = false;

    return result;
  }

  /**
   * 清除公共地图的缓存信息
   */
  private async clearPublicCache(cityCode: string) {
    const sorts = await this.connection
      .getRepository(PointSortEntity)
      .find({ where: { userId: PUBLIC_MAP_USER_ID, cityCode }, select: ['sortId'] });

    await this.mcacheService.uncacheCitys();
    await this.mcacheService.uncacheCitySorts(cityCode);
    for (let i = 0; i < sorts.length; i++) {
      await this.mcacheService.uncacheCitySortPoints(cityCode, sorts[i].sortId);
    }
  }

  /**
   * 检查迁移的点位是否重复
   */
  private async checkoutTransferPointSame(
    providerId: number,
    userId: number,
  ): Promise<any> {
    const froms = await this.connection.getRepository(PointSaveEntity).find({
      where: { userId: providerId, ownType: PointOwnTypes.MY_CREATE },
      select: ['pointId', 'psaveId'],
    });
    let names = [];
    const tos = await this.connection
      .getRepository(PointSaveEntity)
      .find({ where: { userId }, select: ['pointId', 'psaveId'] });
    const fromPointIds = [],
      toPointIds = [];

    froms.forEach(save => {
      fromPointIds.push(save.pointId);
    });
    tos.forEach(save => {
      toPointIds.push(save.pointId);
    });

    const sames = UtilsService.hasSame(fromPointIds, toPointIds);

    if (sames.length > 0) {
      const psaveIds = [];
      sames.forEach(pointId => {
        froms.forEach(from => {
          if (from.pointId === pointId) {
            psaveIds.push(from.psaveId);
          }
        });
      });

      names = await this.connection
        .getRepository(PointSaveEntity)
        .findByIds(psaveIds, { select: ['name', 'tag'] });
    }

    return names;
  }

  /**
   * 检查SAVE_FIND状态的点位
   */
  private async checkNotCreatePointCount(providerId: number): Promise<any> {
    const points = await this.connection
      .getRepository(PointSaveEntity)
      .count({ userId: providerId, ownType: Not(PointOwnTypes.MY_CREATE) });
    if (points > 0) {
      throw new ForbiddenException(ERRORS.TRANSFER_HAVE_SAVEFINDS);
    }
  }

  /**
   * 检查迁移的点位是否都写了文章
   */
  private async checkAllPointHasNote(providerId: number): Promise<any> {
    const points = await this.connection
      .getRepository(PointSaveEntity)
      .count({ userId: providerId });

    const pointNotes = await this.connection
      .getRepository(PointSaveEntity)
      .count({ userId: providerId, noteId: MoreThan(0) });

    if (points !== pointNotes) {
      const pointNotNotes = await this.connection
        .getRepository(PointSaveEntity)
        .find({ where: { userId: providerId, noteId: 0 }, select: ['name', 'tag'] });
      throw new ForbiddenException({
        ...ERRORS.TRANSFER_POINT_NOTNOTES,
        extraMsg: pointNotNotes,
      });
    }
  }

  /**
   * 执行迁移到公共地图操作
   */
  async transferPublicMap(cDto: PublicMapTransferDTO): Promise<boolean> {
    const cCode = UtilsService.cityCode(cDto.cityName);
    if (!cCode) {
      throw new BadRequestException(ERRORS.PARAMS_INVALID);
    }

    const user = await this.connection
      .getRepository(UserEntity)
      .findOne({ userId: cDto.providerId }, { select: ['defaultCss'] });
    if (user.defaultCss !== 0) {
      throw new ForbiddenException(ERRORS.TRANSFER_USER_DEFAULTCSS);
    }

    await this.checkNotCreatePointCount(cDto.providerId);
    await this.checkAllPointHasNote(cDto.providerId);

    const sames = await this.checkoutTransferPointSame(
      cDto.providerId,
      PUBLIC_MAP_USER_ID,
    );
    if (sames.length !== 0) {
      throw new ForbiddenException({ ...ERRORS.TRANSFER_POINT_SAME, extraMsg: sames });
    }

    /**
     * 检查迁移的点位是否属于对应的目的城市
     */
    const pointAlias = 'point',
      psaveAlias = 'psave';
    const where = `${psaveAlias}.userId = ${cDto.providerId} and ${psaveAlias}.ownType != '${PointOwnTypes.ONLY_SAVE}'`;
    const queryFields = [
      `${psaveAlias}.pointId`,
      `${psaveAlias}.ownType`,
      `${pointAlias}.code`,
    ];
    const psaves: any = await this.connection
      .createQueryBuilder(PointSaveEntity, psaveAlias)
      .innerJoinAndMapOne(
        `${psaveAlias}.point`,
        MapPointEntity,
        pointAlias,
        `${pointAlias}.pointId = ${psaveAlias}.pointId`,
      )
      .where(where)
      .select(queryFields)
      .getMany();
    for (let i = 0; i < psaves.length; i++) {
      const code: any = PointUtilsService.formatAdcode(psaves[i].point.code);
      if (code.cCode !== cCode) {
        throw new ForbiddenException(ERRORS.TRANSFER_POINT_CITY_DONTMATCHED);
      }
    }

    await this.userTranfer(cDto.providerId, PUBLIC_MAP_USER_ID, cCode);
    await this.clearPublicCache(cCode);
    return true;
  }
}
