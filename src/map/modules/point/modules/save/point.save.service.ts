import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { ERRORS } from '@rehuo/common/constants/error.constant';
import { PUBLIC_MAP_USER_ID } from '@rehuo/common/constants/map.constant';
import {
  MessageQueryTypes,
  MessageReturnTypes,
} from '@rehuo/common/constants/message.constant';
import { PointOwnTypes } from '@rehuo/common/constants/point.constant';
import {
  NoteStatFields,
  RedisNames,
  RedisTimeouts,
  UserStatFields,
} from '@rehuo/common/constants/redis.constant';
import { RehuoOffical } from '@rehuo/common/constants/rehuo.constant';
import { DBService } from '@rehuo/common/db/db.service';
import { PageRequestDTO } from '@rehuo/common/dtos/page.request.dto';
import { PageResponseInternalDTO } from '@rehuo/common/dtos/page.response.dto';
import { ISaveMessage, ITopMessage } from '@rehuo/common/interfaces/message.interface';
import { UtilsService } from '@rehuo/common/providers/utils.service';
import { MessageService } from '@rehuo/message/message.service';
import { MapPointEntity } from '@rehuo/models/map.point.entity';
import { NoteSaveEntity } from '@rehuo/models/note.save.entity';
import { NoteStatEntity } from '@rehuo/models/note.stat.entity';
import { PointNoteEntity } from '@rehuo/models/point.note.entity';
import { PointSaveEntity } from '@rehuo/models/point.save.entity';
import { PointSaveStatEntity } from '@rehuo/models/point.save.stat.entity';
import { PointSortEntity } from '@rehuo/models/point.sort.entity';
import { UserClockEntity } from '@rehuo/models/user.clock.entity';
import { UserEntity } from '@rehuo/models/user.entity';
import { UserLinkEntity } from '@rehuo/models/user.link.entity';
import { RedisService } from '@rehuo/redis/redis.service';
import { UserClockService } from '@rehuo/user/modules/userclock/user.clock.service';
import { UserService } from '@rehuo/user/services/user.service';
import { UserStatService } from '@rehuo/user/services/user.stat.service';
import { Connection, EntityManager, FindConditions, Repository } from 'typeorm';
import { MapPointService } from '../../services/map.point.service';
import { PointUtilsService } from '../../services/point.utils.service';
import { NoteStatService } from '../note/services/note.stat.service';
import { PointNoteService } from '../note/services/point.note.service';
import {
  PointSaveCreateDTO,
  PointSaveGetDTO,
  PointSaveGetMoreDTO,
  PointSaveGetMyDTO,
  PointSaveUpdateDTO,
} from './dtos/point.save.crud.dto';

const ssFields: any[] = [
  'psaveId',
  'userId',
  'pointId',
  'sortId',
  'logo',
  'isPassed',
  'price',
  'ownType',
  'name',
  'tag',
  'topNoteId',
  'isToped',
];

@Injectable()
export class PointSaveService extends DBService<PointSaveEntity> {
  constructor(
    @InjectRepository(PointSaveEntity)
    private psRepo: Repository<PointSaveEntity>,

    @InjectConnection()
    private readonly connection: Connection,
    @Inject(forwardRef(() => PointNoteService))
    private readonly pnoteService: PointNoteService,
    @Inject(forwardRef(() => MapPointService))
    private readonly mpointService: MapPointService,
    @Inject(forwardRef(() => MessageService))
    private readonly msgService: MessageService,
    @Inject(forwardRef(() => UserStatService))
    private readonly ustatService: UserStatService,
    @Inject(forwardRef(() => NoteStatService))
    private readonly nstatService: NoteStatService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => RedisService))
    private readonly redisService: RedisService,
    @Inject(forwardRef(() => UserClockService))
    private readonly uclockService: UserClockService,
  ) {
    super(psRepo, PointSaveService.name);
  }

  private async cache(
    psaveId: number,
    data: object,
    fields?: string[],
  ): Promise<boolean> {
    const key = UtilsService.format(RedisNames.POINT_SAVE, psaveId);
    const obj = fields ? UtilsService.extractSome(data, fields) : data;
    return this.redisService.save(key, JSON.stringify(obj), RedisTimeouts.POINT_SAVE);
  }

  private async uncache(psaveId: number) {
    const key = UtilsService.format(RedisNames.POINT_SAVE, psaveId);
    await this.redisService.unsave(key);
  }

  private async getByCache(psaveId: number): Promise<any> {
    const key = UtilsService.format(RedisNames.POINT_SAVE, psaveId);
    const pointsave = await this.redisService.get(key);
    if (pointsave) {
      return JSON.parse(pointsave);
    }
    return pointsave;
  }

  async incrTops(noteId: number, userId: number): Promise<any> {
    await this.nstatService.updateStat(noteId, NoteStatFields.TOPS, 1);
    await this.ustatService.updateStat(userId, UserStatFields.NOTE_TOPS, 1);
  }

  async updateNumber(txEntityManager: EntityManager, psave: PointSaveEntity) {
    await txEntityManager.increment(
      PointSaveStatEntity,
      { psaveId: psave.ffpsaveId },
      'saves',
      1,
    );
    await txEntityManager.increment(
      UserEntity,
      { userId: psave.userId },
      'defaultCss',
      1,
    );
    const field =
      psave.ownType === PointOwnTypes.ONLY_SAVE ? 'savePoints' : 'createPoints';
    await txEntityManager.increment(UserEntity, { userId: psave.userId }, field, 1);

    if (psave.topNoteId > 0) {
      const noteUser = await txEntityManager.findOne(
        PointNoteEntity,
        { noteId: Number(psave.topNoteId) },
        { select: ['userId'] },
      );
      await this.incrTops(Number(psave.topNoteId), noteUser.userId);
    }
  }

  /**
   * 新建点位收藏
   */
  async createOne(cDto: PointSaveCreateDTO): Promise<any> {
    const { userId, psaveId } = cDto;
    const psaveAlias = 'save',
      noteAlias = 'note',
      pointAlias = 'point';
    const queryFields = [
      `${psaveAlias}.pointId`,
      `${psaveAlias}.ffpsaveId`,
      `${psaveAlias}.name`,
      `${psaveAlias}.tag`,
      `${psaveAlias}.logo`,
      `${psaveAlias}.price`,
      `${psaveAlias}.topNoteId`,
      `${psaveAlias}.userId`,
      `${psaveAlias}.isToped`,
      `${psaveAlias}.noteId`,
      `${pointAlias}.code`,
    ];
    const where = `${psaveAlias}.psaveId = ${psaveId}`;

    const pointsave: any = await this.connection
      .createQueryBuilder(PointSaveEntity, psaveAlias)
      .innerJoinAndMapOne(
        `${psaveAlias}.point`,
        MapPointEntity,
        pointAlias,
        `${pointAlias}.pointId = ${psaveAlias}.pointId`,
      )
      .leftJoinAndMapOne(
        `${psaveAlias}.note`,
        PointNoteEntity,
        noteAlias,
        `${noteAlias}.noteId = ${psaveAlias}.noteId`,
      )
      .select(queryFields)
      .where(where)
      .getOne();
    const adcode = pointsave.point.code;

    const key = UtilsService.format(RedisNames.USER_SAVE_POINT_LOCKED, userId, psaveId);
    let save;

    try {
      if (!(await this.redisService.lock(key))) {
        return;
      }
      await this.connection.transaction('READ COMMITTED', async txEntityManager => {
        //收藏点位信息
        save = new PointSaveEntity();
        save.sortId = 0;
        save.name = pointsave.name;
        save.tag = pointsave.tag;
        save.logo = pointsave.logo;
        save.price = pointsave.price;
        save.pointId = pointsave.pointId;
        save.fpsaveId = psaveId;
        save.ffpsaveId = pointsave.ffpsaveId;
        save.ownType = PointOwnTypes.ONLY_SAVE;
        save.userId = userId;
        if (pointsave.isToped) {
          save.topNoteId = pointsave.topNoteId;
        } else {
          save.topNoteId = pointsave.noteId > 0 ? pointsave.noteId : pointsave.topNoteId;
        }
        save = await txEntityManager.save(PointSaveEntity, save);

        await this.updateNumber(txEntityManager, save);
        await PointUtilsService.incrementPCP(txEntityManager, userId, adcode);

        //检查收藏者和被收藏者之间是否存在关联关系
        if (userId !== pointsave.userId) {
          const userlink = await txEntityManager.findOne(
            UserLinkEntity,
            { userId, followerId: pointsave.userId },
            { select: ['ulId'] },
          );
          if (!userlink) {
            const ul = new UserLinkEntity();
            ul.followerId = pointsave.userId;
            ul.userId = userId;
            await txEntityManager.save(ul);
          }
        }
      });

      const message: ISaveMessage = {
        userId,
        psaveId,
        type: MessageReturnTypes.SAVE_POINT,
      };
      await this.msgService.message(pointsave.userId, message, MessageQueryTypes.SAVETOP);

      const point = await this.mpointService.getOne({ pointId: save.pointId });

      return Object.assign(point, save);
    } catch (err) {
      const dupEntry = 'ER_DUP_ENTRY';
      Logger.error(err.message, PointSaveService.name);
      if (err.message.search(dupEntry) === 0) {
        throw new ForbiddenException(ERRORS.POINTSAVE_DUP);
      }
      throw err;
    } finally {
      await this.redisService.unlock(key);
    }
  }

  /**
   * 更新点位收藏信息
   */
  async updateOne(
    findData: FindConditions<PointSaveEntity>,
    uDto: PointSaveUpdateDTO,
  ): Promise<any> {
    const { psaveId, tag, price, logo, sortId, name } = uDto;
    const pointsave = await this.findOne({ psaveId, userId: findData.userId }, [
      'pointId',
      'sortId',
    ]);
    try {
      let entity;
      await this.connection.transaction('READ COMMITTED', async txEntityManager => {
        //如果sortId更改
        if (uDto.hasOwnProperty('sortId')) {
          await PointUtilsService.updateBySortIdChanged(
            txEntityManager,
            Number(findData.userId),
            sortId,
            pointsave.sortId,
          );
        }
        const update = new PointSaveEntity();
        name ? (update.name = name) : null;
        tag ? (update.tag = tag) : null;
        price ? (update.price = price) : null;
        logo ? (update.logo = logo) : null;
        sortId ? (update.sortId = sortId) : null;
        entity = await txEntityManager.update(
          PointSaveEntity,
          { psaveId, userId: findData.userId },
          update,
        );
        if (name) {
          await txEntityManager.update(
            MapPointEntity,
            { pointId: pointsave.pointId },
            { name },
          );
        }
      });

      return entity;
    } catch (err) {
      throw err;
    }
  }

  /**
   * 删除点位收藏信息
   */
  async deleteOne(findData: FindConditions<PointSaveEntity>): Promise<any> {
    const { userId } = findData;
    try {
      const psaveAlias = 'psave',
        pointAlias = 'point';
      const queryFields = [
        `${psaveAlias}.ffpsaveId`,
        `${psaveAlias}.pointId`,
        `${psaveAlias}.sortId`,
        `${psaveAlias}.ownType`,
        `${pointAlias}.code`,
      ];
      const where = `${psaveAlias}.userId = ${findData.userId} and ${psaveAlias}.psaveId = ${findData.psaveId}`;

      const pointsave: any = await this.connection
        .createQueryBuilder(PointSaveEntity, psaveAlias)
        .innerJoinAndMapOne(
          `${psaveAlias}.point`,
          MapPointEntity,
          pointAlias,
          `${pointAlias}.pointId = ${psaveAlias}.pointId`,
        )
        .select(queryFields)
        .where(where)
        .getOne();
      const adcode = pointsave.point.code;
      await this.connection.transaction('READ COMMITTED', async txEntityManager => {
        if (pointsave.ownType === PointOwnTypes.ONLY_SAVE) {
          await txEntityManager.decrement(UserEntity, { userId }, 'savePoints', 1);
        } else {
          await txEntityManager.decrement(UserEntity, { userId }, 'createPoints', 1);
        }

        //如果是创建的点位，则删除其统计数据
        if (pointsave.ownType !== PointOwnTypes.MY_CREATE) {
          await txEntityManager.decrement(
            PointSaveStatEntity,
            { psaveId: pointsave.ffpsaveId },
            'saves',
            1,
          );
        }

        //分类的points减一
        if (pointsave.sortId === 0) {
          await txEntityManager.decrement(UserEntity, { userId }, 'defaultCss', 1);
        } else {
          await txEntityManager.decrement(
            PointSortEntity,
            { sortId: pointsave.sortId },
            'points',
            1,
          );
        }

        await txEntityManager.delete(NoteSaveEntity, findData);
        await txEntityManager.delete(UserClockEntity, {
          userId,
          pointId: pointsave.pointId,
        });
        await txEntityManager.softDelete(PointSaveEntity, findData);
        await PointUtilsService.decrementPCP(
          txEntityManager,
          Number(findData.userId),
          adcode,
        );
      });
    } catch (err) {
      throw err;
    }
  }

  /**
   * 置顶文章
   */
  async setTop(findData: FindConditions<PointSaveEntity>, noteId: number): Promise<any> {
    const { psaveId, userId } = findData;
    const note = await this.pnoteService.findOne({ noteId }, ['userId']);
    const pointsave = await this.getOne({ psaveId, userId }, ['noteId']);

    await this.incrTops(noteId, note.userId);

    if (pointsave.noteId === noteId) {
      await this.update({ psaveId, userId }, { topNoteId: 0, isToped: false });
    } else {
      await this.update({ psaveId, userId }, { topNoteId: noteId, isToped: true });
    }

    const message: ITopMessage = {
      userId: Number(userId),
      psaveId: Number(psaveId),
      noteId,
      type: MessageReturnTypes.SET_TOP,
    };
    await this.msgService.message(note.userId, message, MessageQueryTypes.SAVETOP);

    return true;
  }

  /**
   * 获取点位收藏信息
   */
  async getOne(
    findData: FindConditions<PointSaveEntity>,
    fields: any[] = ssFields,
  ): Promise<any> {
    return this.findOne(findData, fields);
  }

  /**
   * 获取点位收藏信息
   */
  async getOneWithDeleted(
    findData: FindConditions<PointSaveEntity>,
    fields: any[] = ssFields,
  ): Promise<any> {
    return this.findOneWithDeleted(findData, fields);
  }

  /**
   * 获取部分点位信息
   */
  async getMy(gDto: PointSaveGetMyDTO): Promise<any> {
    const psaveAlias = 'save',
      pointAlias = 'point',
      noteStatAlias = 'nstat',
      noteAlias = 'note',
      psaveStatAlias = 'stat';

    const queryFields = [
      `${psaveAlias}.psaveId`,
      `${psaveAlias}.ffpsaveId`,
      `${psaveAlias}.pointId`,
      `${psaveAlias}.name`,
      `${psaveAlias}.tag`,
      `${psaveAlias}.noteId`,
      `${psaveAlias}.topNoteId`,
      `${psaveAlias}.sortId`,
      `${psaveAlias}.updatedAt`,
      `${psaveAlias}.logo`,
      `${psaveAlias}.ownType`,
      `${psaveAlias}.price`,
      `${pointAlias}.address`,
      `${psaveStatAlias}.saves`,
      `${psaveStatAlias}.goods`,
      `${psaveStatAlias}.bads`,
    ];

    const queryNoteFields = [
      `${noteAlias}.noteId`,
      `${noteAlias}.title`,
      `${noteAlias}.medias`,
      `${noteAlias}.content`,
      `${noteAlias}.updatedAt`,
      `${noteStatAlias}.views`,
      `${noteStatAlias}.likes`,
      `${noteStatAlias}.tops`,
    ];

    const where = `${psaveAlias}.userId = ${gDto.userId} and ${psaveAlias}.ownType != '${PointOwnTypes.ONLY_SAVE}'`;

    //查询自己创建的点位或者自己写了文章的点位
    const [points, pointCounts]: [any, number] = await this.connection
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
      .select(queryFields)
      .skip(gDto.start)
      .where(where)
      .take(gDto.take)
      .orderBy(`${psaveAlias}.updatedAt`, gDto.order)
      .getManyAndCount();

    const page = new PageResponseInternalDTO(gDto.start, points.length, pointCounts);
    if (points.length === 0) {
      return {
        points: [],
        page,
      };
    }

    const noteIds = [];
    points.forEach(point => {
      Object.assign(point, point.point);
      Object.assign(point, point.stat);
      delete point.point;
      delete point.stat;
      if (point.noteId !== 0) {
        noteIds.push(point.noteId);
      }
    });

    if (noteIds.length === 0) {
      return { points, page };
    }

    const notes: any[] = await this.connection
      .createQueryBuilder(PointNoteEntity, noteAlias)
      .innerJoinAndMapOne(
        `${noteAlias}.nstat`,
        NoteStatEntity,
        noteStatAlias,
        `${noteStatAlias}.noteId = ${noteAlias}.noteId`,
      )
      .select(queryNoteFields)
      .whereInIds(noteIds)
      .orderBy(UtilsService.orderString(`${noteAlias}.noteId`, noteIds))
      .getMany();

    const nstatKeys = [];
    notes.forEach(note => {
      nstatKeys.push(UtilsService.format(RedisNames.NOTE_STATS, note.noteId));
    });

    const cacheNstats = await this.redisService.hmgetall(nstatKeys);
    notes.forEach((note, index) => {
      const nstat: any = UtilsService.arrayToObject(cacheNstats[index]);
      if (nstat) {
        Object.assign(note, nstat);
      } else {
        Object.assign(note, note.nstat);
      }
      delete note.nstat;
    });

    points.forEach(point => {
      for (let i = 0; i < notes.length; i++) {
        if (point.noteId === notes[i].noteId) {
          Object.assign(point, notes[i]);
          break;
        }
      }
    });

    return { points, page };
  }

  /**
   * 获取部分点位信息
   */
  async getSave(
    findData: FindConditions<PointSaveEntity>,
    pageDto: PageRequestDTO,
  ): Promise<any> {
    const psaveAlias = 'save',
      pointAlias = 'point',
      noteAlias = 'note',
      noteStatAlias = 'nstat',
      userAlias = 'user',
      psaveStatAlias = 'stat';

    const queryFields = [
      `${psaveAlias}.psaveId`,
      `${psaveAlias}.ffpsaveId`,
      `${psaveAlias}.pointId`,
      `${psaveAlias}.userId`,
      `${psaveAlias}.name`,
      `${psaveAlias}.tag`,
      `${psaveAlias}.sortId`,
      `${psaveAlias}.noteId`,
      `${psaveAlias}.topNoteId`,
      `${psaveAlias}.isToped`,
      `${psaveAlias}.logo`,
      `${psaveAlias}.price`,
      `${psaveAlias}.updatedAt`,
      `${pointAlias}.address`,
      `${psaveStatAlias}.saves`,
      `${psaveStatAlias}.goods`,
      `${psaveStatAlias}.bads`,
    ];
    const queryNoteFields = [
      `${noteAlias}.noteId`,
      `${noteAlias}.title`,
      `${noteAlias}.medias`,
      `${noteAlias}.updatedAt`,
      `${noteAlias}.userId`,
      `${noteStatAlias}.views`,
      `${noteStatAlias}.tops`,
      `${userAlias}.nickName`,
      `${userAlias}.avatarUrl`,
    ];
    const where = `${psaveAlias}.userId = ${findData.userId} and ${psaveAlias}.ownType = '${PointOwnTypes.ONLY_SAVE}'`;

    const [points, pointCounts]: [any, number] = await this.connection
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
      .select(queryFields)
      .skip(pageDto.start)
      .where(where)
      .take(pageDto.take)
      .orderBy(`${psaveAlias}.psaveId`, pageDto.order)
      .getManyAndCount();

    const page = new PageResponseInternalDTO(pageDto.start, points.length, pointCounts);
    if (points.length === 0) {
      return {
        points: [],
        page,
      };
    }

    const noteIds = [],
      userIds = [],
      ffpsaveIds = [];
    const nstatKeys = [];

    points.forEach(point => {
      Object.assign(point, point.point);
      Object.assign(point, point.stat);
      delete point.point;
      delete point.stat;
      if (point.noteId === 0 && point.topNoteId === 0) {
        ffpsaveIds.push(point.ffpsaveId);
      } else {
        const noteId = point.noteId === 0 ? point.topNoteId : point.noteId;
        noteIds.push(noteId);
        nstatKeys.push(UtilsService.format(RedisNames.NOTE_STATS, noteId));
        if (point.noteId === 0) {
          point.noteId = point.topNoteId;
        }
        delete point.topNoteId;
      }
    });

    //获取到点位创建者的userId
    if (ffpsaveIds.length > 0) {
      const ffpsaves = await this.findByIdsWithDeleted(ffpsaveIds, ['psaveId', 'userId']);
      for (let i = 0; i < ffpsaves.length; i++) {
        for (let j = 0; j < points.length; j++) {
          if (ffpsaves[i].psaveId === points[j].ffpsaveId) {
            points[j].userId = ffpsaves[i].userId;
            break;
          }
        }
      }

      ffpsaves.forEach(ffpsave => {
        userIds.push(ffpsave.userId);
      });
    }

    let users = [],
      notes = [];

    //查询没有文章的点位对应创建者的头像
    if (userIds.length > 0) {
      users = await this.userService.getByIds(userIds, [
        'userId',
        'nickName',
        'avatarUrl',
      ]);
    }

    //查询文章
    if (noteIds.length > 0) {
      notes = await this.connection
        .createQueryBuilder(PointNoteEntity, noteAlias)
        .leftJoinAndMapOne(
          `${noteAlias}.user`,
          UserEntity,
          userAlias,
          `${userAlias}.userId = ${noteAlias}.userId`,
        )
        .innerJoinAndMapOne(
          `${noteAlias}.nstat`,
          NoteStatEntity,
          noteStatAlias,
          `${noteStatAlias}.noteId = ${noteAlias}.noteId`,
        )
        .select(queryNoteFields)
        .whereInIds(noteIds)
        .orderBy(UtilsService.orderString(`${noteAlias}.noteId`, noteIds))
        .getMany();
      const cacheNstats = await this.redisService.hmgetall(nstatKeys);
      notes.forEach((note, index) => {
        const nstat = UtilsService.arrayToObject(cacheNstats[index]);
        if (nstat) {
          note.nstat = nstat;
        }
      });
    }
    points.forEach(point => {
      if (point.noteId === 0) {
        for (let i = 0; i < users.length; i++) {
          if (users[i].userId === point.userId) {
            Object.assign(point, users[i]);
            break;
          }
        }
      } else {
        notes.forEach(note => {
          if (point.noteId === note.noteId) {
            Object.assign(note, note.nstat);
            Object.assign(note, note.user);
            delete note.nstat;
            delete note.user;
            Object.assign(point, note);
          }
          if (note.userId === PUBLIC_MAP_USER_ID) {
            Object.assign(point, RehuoOffical);
          }
        });
      }
    });
    return { points, page };
  }

  /**
   * 获取点位收藏基本信息
   */
  async getPoint(gDto: PointSaveGetDTO): Promise<any> {
    const psaveAlias = 'save',
      pointAlias = 'point',
      sortAlias = 'sort';
    const where = `${psaveAlias}.psaveId = ${gDto.psaveId}`;

    const queryFields = [
      `${psaveAlias}.psaveId`,
      `${psaveAlias}.pointId`,
      `${psaveAlias}.userId`,
      `${psaveAlias}.name`,
      `${psaveAlias}.tag`,
      `${psaveAlias}.logo`,
      `${psaveAlias}.sortId`,
      `${psaveAlias}.price`,
      `${psaveAlias}.ownType`,
      `${pointAlias}.address`,
      `${pointAlias}.longitude`,
      `${pointAlias}.latitude`,
      `${sortAlias}.name`,
    ];
    const point: any = await this.connection
      .createQueryBuilder(PointSaveEntity, psaveAlias)
      .innerJoinAndMapOne(
        `${psaveAlias}.point`,
        MapPointEntity,
        pointAlias,
        `${pointAlias}.pointId = ${psaveAlias}.pointId`,
      )
      .leftJoinAndMapOne(
        `${psaveAlias}.sort`,
        PointSortEntity,
        sortAlias,
        `${sortAlias}.sortId = ${psaveAlias}.sortId`,
      )
      .select(queryFields)
      .where(where)
      .getOne();

    if (point.sort && point.sort.name) {
      point.sortName = point.sort.name;
    }

    Object.assign(point, point.point);
    delete point.sort;
    delete point.point;
    return point;
  }

  /**
   * 通过点位收藏ID获取点位收藏信息和点位信息
   */
  async getPointMore(gDto: PointSaveGetMoreDTO): Promise<any> {
    const psaveAlias = 'save',
      pointAlias = 'point',
      psaveStatAlias = 'stat';
    const where = `${psaveAlias}.psaveId = ${gDto.psaveId}`;

    const queryFields = [
      `${psaveAlias}.psaveId`,
      `${psaveAlias}.ffpsaveId`,
      `${psaveAlias}.pointId`,
      `${psaveAlias}.userId`,
      `${psaveAlias}.name`,
      `${psaveAlias}.tag`,
      `${psaveAlias}.logo`,
      `${psaveAlias}.price`,
      `${psaveAlias}.ownType`,
      `${psaveAlias}.sortId`,
      `${psaveAlias}.noteId`,
      `${psaveAlias}.isToped`,
      `${psaveAlias}.topNoteId`,
      `${pointAlias}.address`,
      `${pointAlias}.longitude`,
      `${pointAlias}.latitude`,
      `${psaveStatAlias}.goods`,
      `${psaveStatAlias}.bads`,
      `${psaveStatAlias}.saves`,
      `${psaveStatAlias}.shares`,
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
        `${psaveStatAlias}.psaveId = ${psaveAlias}.ffpsaveId`,
      )
      .select(queryFields)
      .where(where)
      .getOne();

    if (!point) {
      return null;
    }

    //如果是在别人的地图上面，查看是否已经收藏
    if (gDto.mo === 'O') {
      const newSave = await this.findOneNotException(
        { userId: gDto.userId, pointId: point.pointId },
        ['psaveId', 'ownType'],
      );
      if (newSave) {
        point.newPsaveId = newSave.psaveId;
        point.ownType = newSave.ownType;
      }
    }

    //获取点位创建者的userId
    if (point.ownType != PointOwnTypes.MY_CREATE) {
      const ppoint = await this.getOneWithDeleted({ psaveId: point.ffpsaveId }, [
        'userId',
      ]);
      point.createrId =
        ppoint.userId === PUBLIC_MAP_USER_ID ? point.userId : ppoint.userId;
    }

    Object.assign(point, point.point);
    Object.assign(point, point.stat);
    delete point.point;
    delete point.stat;

    //是否在过去一天进行了打卡
    point.isClocked = await this.uclockService.checkOne({
      userId: gDto.userId,
      pointId: point.pointId,
    });

    delete point.pointId;
    return point;
  }
}
