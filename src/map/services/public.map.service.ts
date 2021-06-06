import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { ChinaCitys } from '@rehuo/common/constants/city.constant';
import { ERRORS } from '@rehuo/common/constants/error.constant';
import { PUBLIC_MAP_USER_ID } from '@rehuo/common/constants/map.constant';
import { MapPointFieldLengths } from '@rehuo/common/constants/point.constant';
import { RehuoOffical } from '@rehuo/common/constants/rehuo.constant';
import { SqlOrderTypes } from '@rehuo/common/constants/sql.constant';
import { PageRequestDTO } from '@rehuo/common/dtos/page.request.dto';
import { PageResponseInternalDTO } from '@rehuo/common/dtos/page.response.dto';
import { UtilsService } from '@rehuo/common/providers/utils.service';
import { MapPointEntity } from '@rehuo/models/map.point.entity';
import { NoteStatEntity } from '@rehuo/models/note.stat.entity';
import { PointNoteEntity } from '@rehuo/models/point.note.entity';
import { PointSaveEntity } from '@rehuo/models/point.save.entity';
import { PointSaveStatEntity } from '@rehuo/models/point.save.stat.entity';
import { PublicCityEntity } from '@rehuo/models/public.city.entity';
import { UserEntity } from '@rehuo/models/user.entity';
import { UserClockService } from '@rehuo/user/modules/userclock/user.clock.service';
import { Connection } from 'typeorm';
import {
  CityPointDetailGetDTO,
  CityPointNotesGetDTO,
  CityPointsNearDTO,
  CitySortPointsGetDTO,
} from '../dtos/map.crud.dto';
import { PointNoteService } from '../modules/point/modules/note/services/point.note.service';
import { CitySortsGetDTO } from '../modules/point/modules/sort/dtos/point.sort.crud.dto';
import { PointSortService } from '../modules/point/modules/sort/point.sort.service';
import { PointUtilsService } from '../modules/point/services/point.utils.service';
import { MapCacheService } from './map.cache.service';
import * as _geolib from 'geolib';

@Injectable()
export class PublicMapService {
  constructor(
    @InjectConnection()
    private readonly connection: Connection,
    @Inject(forwardRef(() => PointSortService))
    private readonly psortService: PointSortService,
    @Inject(forwardRef(() => UserClockService))
    private readonly uclockService: UserClockService,
    private readonly mcacheService: MapCacheService,
    @Inject(forwardRef(() => PointNoteService))
    private readonly pnoteService: PointNoteService,
  ) { }

  private dealBrackets(name: string): string {
    let tag, indexAt;
    if (name.length > MapPointFieldLengths.TAG) {
      indexAt = name.search(/\(/);
      if (!indexAt || indexAt === -1 || indexAt > MapPointFieldLengths.TAG) {
        tag = name.slice(0, MapPointFieldLengths.TAG);
      } else if (indexAt > 1) {
        tag = name.slice(0, indexAt);
      }
    } else {
      tag = name;
    }

    return tag;
  }

  /**
   * 获取城市分类对应的点位信息
   */
  private async getByCodeOrSort(code: string, sortId?: number): Promise<any> {
    const pointAlias = 'point',
      psaveAlias = 'save',
      psaveStatAlias = 'stat';
    const QueryFields = [
      `${psaveAlias}.psaveId`,
      `${psaveAlias}.ffpsaveId`,
      `${psaveAlias}.pointId`,
      `${psaveAlias}.name`,
      `${psaveAlias}.logo`,
      `${pointAlias}.code`,
      `${pointAlias}.latitude`,
      `${pointAlias}.longitude`,
      `${psaveStatAlias}.goods`,
    ];

    const createrId = PUBLIC_MAP_USER_ID;
    const { fCode } = PointUtilsService.formatAdcode(code);
    const where = sortId
      ? `${psaveAlias}.userId = ${createrId} and ${psaveAlias}.sortId = ${sortId}`
      : `${psaveAlias}.userId = ${createrId}`;
    const wherePoint = `${pointAlias}.pointId = ${psaveAlias}.pointId and ${pointAlias}.code like '${fCode}%'`;

    const points: any = await this.connection
      .createQueryBuilder(PointSaveEntity, psaveAlias)
      .innerJoinAndMapOne(`${psaveAlias}.point`, MapPointEntity, pointAlias, wherePoint)
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

    if (sortId) {
      points.forEach(point => {
        Object.assign(point, point.point);
        Object.assign(point, point.stat);
        point.tag = this.dealBrackets(point.name);

        delete point.point;
        delete point.stat;
        delete point.pointId;
      });
    }

    return points;
  }

  /**
   * 获取公共地图点位信息
   */
  private async pointDetail(gDto: CityPointDetailGetDTO): Promise<any> {
    const psaveAlias = 'save',
      psaveStatAlias = 'stat',
      pointAlias = 'point';
    const where = `${psaveAlias}.psaveId = ${gDto.psaveId}`;

    const queryFields = [
      `${psaveAlias}.psaveId`,
      `${psaveAlias}.pointId`,
      `${psaveAlias}.name`,
      `${psaveAlias}.logo`,
      `${psaveAlias}.tag`,
      `${pointAlias}.address`,
      `${pointAlias}.longitude`,
      `${pointAlias}.latitude`,
      `${psaveStatAlias}.goods`,
      `${psaveStatAlias}.bads`,
      `${psaveStatAlias}.saves`,
    ];

    const point: any = await this.connection
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
        `${psaveStatAlias}.psaveId = ${psaveAlias}.psaveId`,
      )
      .select(queryFields)
      .where(where)
      .getOne();

    Object.assign(point, point.point);
    Object.assign(point, point.stat);

    // //是否在过去一天进行了打卡
    point.isClocked = await this.uclockService.checkOne({
      userId: gDto.userId,
      pointId: point.pointId,
    });

    delete point.point;
    delete point.stat;

    /**
     * 查看人是否已经写了文章
     */
    const myPsave = await this.connection.getRepository(PointSaveEntity).findOne({
      where: { userId: gDto.userId, pointId: point.pointId },
      select: ['psaveId', 'noteId'],
    });
    if (myPsave && myPsave.noteId > 0) {
      point.newPsaveId = myPsave.psaveId;
      point.newNoteId = myPsave.noteId;
    }

    return point;
  }

  /**
   * 点位对应的日记
   */
  private async pointNotes(gDto: CityPointNotesGetDTO): Promise<any> {
    const psaveAlias = 'psave',
      noteAlias = 'note',
      userAlias = 'user',
      noteStatAlias = 'nstat';
    const psave: any = await this.connection
      .getRepository(PointSaveEntity)
      .findOne(
        { psaveId: gDto.psaveId, userId: PUBLIC_MAP_USER_ID },
        { select: ['pointId'] },
      );
    if (!psave) {
      throw new BadRequestException(ERRORS.PARAMS_INVALID);
    }
    const queryFields = [
      `${psaveAlias}.psaveId`,
      `${psaveAlias}.userId`,
      `${userAlias}.nickName`,
      `${userAlias}.avatarUrl`,
      `${noteAlias}.noteId`,
      `${noteAlias}.medias`,
      `${noteAlias}.updatedAt`,
      `${noteAlias}.title`,
      `${noteStatAlias}.likes`,
    ];

    const where = `${psaveAlias}.pointId = ${psave.pointId} and ${psaveAlias}.noteId != 0`;
    const [psaves, psaveCounts] = await this.connection
      .createQueryBuilder(PointSaveEntity, psaveAlias)
      .leftJoinAndMapOne(
        `${psaveAlias}.user`,
        UserEntity,
        userAlias,
        `${userAlias}.userId = ${psaveAlias}.userId`,
      )
      .innerJoinAndMapOne(
        `${psaveAlias}.note`,
        PointNoteEntity,
        noteAlias,
        `${noteAlias}.psaveId = ${psaveAlias}.psaveId and ${noteAlias}.isAudit = true`,
      )
      .innerJoinAndMapOne(
        `${noteAlias}.nstat`,
        NoteStatEntity,
        noteStatAlias,
        `${noteStatAlias}.noteId = ${noteAlias}.noteId`,
      )
      .select(queryFields)
      .where(where)
      .skip(gDto.start)
      .take(gDto.take)
      .orderBy(`${noteStatAlias}.likes`, SqlOrderTypes.DESC)
      .addOrderBy(`${noteAlias}.updatedAt`, SqlOrderTypes.DESC)
      .getManyAndCount();

    const page = new PageResponseInternalDTO(gDto.start, psaves.length, psaveCounts);

    if (psaves.length === 0) {
      return {
        notes: [],
        page,
      };
    }

    psaves.forEach((psave: any) => {
      Object.assign(psave, psave.user);
      Object.assign(psave, psave.note);
      Object.assign(psave, psave.nstat);
      delete psave.user;
      delete psave.note;
      delete psave.nstat;
      if (psave.medias && psave.medias.length > 1) {
        psave.medias = psave.medias.slice(0, 1);
      }
      if (psave.userId === PUBLIC_MAP_USER_ID) {
        Object.assign(psave, RehuoOffical);
      }
    });

    const noteStats = await this.pnoteService.getNoteStatsByCache(psaves);
    psaves.forEach((psave: any, index) => {
      if (noteStats[index]) {
        Object.assign(psave, noteStats[index]);
      }
    });

    return {
      notes: psaves,
      page,
    };
  }

  /**
   * 获取公共地图的城市
   */
  async publicCitys(): Promise<any> {
    let citys = await this.mcacheService.getCitys();
    if (!citys) {
      const pCitys: any[] = await this.connection
        .getRepository(PublicCityEntity)
        .find({ select: ['code'] });
      const rawCitys = [];
      pCitys.forEach(city => {
        rawCitys.push({
          code: city.code,
          ...ChinaCitys['C' + city.code],
          scale: UtilsService.getCityScale(city.code),
        });
      });

      await this.mcacheService.cacheCitys(rawCitys);
      citys = rawCitys;
    }

    return citys;
  }

  /**
   * 获取城市对应分类的点位信息
   */
  async citySortPoints(gDto: CitySortPointsGetDTO): Promise<any> {
    let points = await this.mcacheService.getCitySortPoints(gDto.cityCode, gDto.sortId);
    if (!points) {
      const rawPoints = await this.getByCodeOrSort(gDto.cityCode, gDto.sortId);
      await this.mcacheService.cacheCitySortPoints(gDto.cityCode, gDto.sortId, rawPoints);
      points = rawPoints;
    }

    return points;
  }

  /**
   * 获取城市点位详情页
   */
  async cityPointDetail(gDto: CityPointDetailGetDTO): Promise<any> {
    return this.pointDetail(gDto);
  }

  /**
   * 获取城市点位对应的文章列表
   */
  async cityPointNotes(gDto: CityPointNotesGetDTO): Promise<any> {
    return this.pointNotes(gDto);
  }

  /**
   * 获取城市对应的分类信息
   */
  async citySorts(gDto: CitySortsGetDTO): Promise<any> {
    let sorts = await this.mcacheService.getCitySorts(gDto.cityCode);
    if (!sorts) {
      const rawSorts = await this.psortService.getAll(
        { userId: PUBLIC_MAP_USER_ID, cityCode: gDto.cityCode },
        new PageRequestDTO(0, 1000, SqlOrderTypes.DESC),
      );
      await this.mcacheService.cacheCitySorts(gDto.cityCode, rawSorts);
      sorts = rawSorts;
    }
    return sorts;
  }

  /**
   * 查看定位附近的点位
   */
  async findNear(gDto: CityPointsNearDTO): Promise<any> {
    const points = await this.getByCodeOrSort(gDto.cityCode);
    points.forEach(point => {
      Object.assign(point, point.point);
      Object.assign(point, point.stat);
      point.tag = this.dealBrackets(point.name);

      delete point.point;
      delete point.stat;
      delete point.pointId;
    });

    const sortPoints = _geolib.orderByDistance(
      { latitude: gDto.latitude, longitude: gDto.longitude },
      points,
    );

    const currPoints: any = sortPoints.slice(0, 15);

    currPoints.forEach(point => {
      Object.assign(point, point.point);
      Object.assign(point, point.stat);
      point.tag = this.dealBrackets(point.name);

      delete point.point;
      delete point.stat;
      delete point.pointId;
    });

    return currPoints;
  }
}
