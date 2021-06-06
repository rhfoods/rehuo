import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { ConfigNamespaces } from '@rehuo/common/constants/config.constant';
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
import { SqlOrderTypes } from '@rehuo/common/constants/sql.constant';
import { SystemEnvironments } from '@rehuo/common/constants/system.constant';
import { WechatMiniTypes } from '@rehuo/common/constants/wechat.constant';
import { DBService } from '@rehuo/common/db/db.service';
import { PageResponseInternalDTO } from '@rehuo/common/dtos/page.response.dto';
import { ISaveMessage } from '@rehuo/common/interfaces/message.interface';
import { UtilsService } from '@rehuo/common/providers/utils.service';
import { MessageService } from '@rehuo/message/message.service';
import { MapPointEntity } from '@rehuo/models/map.point.entity';
import { NoteMaskEntity } from '@rehuo/models/note.mask.entity';
import { NoteSaveEntity } from '@rehuo/models/note.save.entity';
import { NoteStatEntity } from '@rehuo/models/note.stat.entity';
import { PointNoteEntity } from '@rehuo/models/point.note.entity';
import { PointSaveEntity } from '@rehuo/models/point.save.entity';
import { PointSaveStatEntity } from '@rehuo/models/point.save.stat.entity';
import { PointSortEntity } from '@rehuo/models/point.sort.entity';
import { UserClockEntity } from '@rehuo/models/user.clock.entity';
import { UserEntity } from '@rehuo/models/user.entity';
import { UserLinkEntity } from '@rehuo/models/user.link.entity';
import { UserRecommendEntity } from '@rehuo/models/user.recommend.entity';
import { RedisService } from '@rehuo/redis/redis.service';
import { WechatService } from '@rehuo/shared/services/wechat.service';
import { UserStatService } from '@rehuo/user/services/user.stat.service';
import { Redis } from 'ioredis';
import { Connection, DeleteResult, FindConditions, Repository } from 'typeorm';
import { PointUtilsService } from '../../../services/point.utils.service';
import { PointSaveService } from '../../save/point.save.service';
import {
  PointNoteCreateDTO,
  PointNoteGetAllDTO,
  PointNoteGetMoreDTO,
  PointNoteGetsDTO,
  PointNoteSaveDTO,
  PointNoteUpdateDTO,
} from '../dtos/point.note.crud.dto';
import { NoteStatService } from './note.stat.service';

const snFields: any = [
  'noteId',
  'updatedAt',
  'title',
  'content',
  'medias',
  'scenes',
  'blLink',
  'wbLink',
  'xhsLink',
  'views',
  'tops',
  'comments',
  'psaveId',
  'userId',
];

@Injectable()
export class PointNoteService extends DBService<PointNoteEntity> {
  private redis: Redis;
  constructor(
    @InjectRepository(PointNoteEntity)
    private pnRepo: Repository<PointNoteEntity>,
    @InjectConnection()
    private readonly connection: Connection,
    @Inject(forwardRef(() => PointSaveService))
    private readonly psaveService: PointSaveService,
    @Inject(forwardRef(() => NoteStatService))
    private readonly nstatService: NoteStatService,
    private readonly ustatService: UserStatService,
    @Inject(forwardRef(() => RedisService))
    private readonly redisService: RedisService,
    private readonly wechatService: WechatService,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => MessageService))
    private readonly msgService: MessageService,
  ) {
    super(pnRepo, PointNoteService.name);
    this.redis = redisService.getClient();
  }

  private async cache(noteId: number, pointNote: PointNoteEntity): Promise<boolean> {
    const key = UtilsService.format(RedisNames.POINT_NOTE, noteId);
    return this.redisService.save(
      key,
      JSON.stringify(UtilsService.extractSome(pointNote, snFields)),
      RedisTimeouts.POINT_NOTE,
    );
  }

  async uncache(noteId: number) {
    await this.redisService.unsave(UtilsService.format(RedisNames.POINT_NOTE, noteId));
  }

  private async getByCache(noteId: number): Promise<any> {
    const key = UtilsService.format(RedisNames.POINT_NOTE, noteId);
    const note = await this.redisService.get(key);
    if (note) {
      return JSON.parse(note);
    }
    return note;
  }

  /**
   * 批量获取缓存中的文章状态数据
   */
  async getNoteStatsByCache(notes: any[]): Promise<any> {
    const nstatKeys = [];
    notes.forEach(note => {
      nstatKeys.push(UtilsService.format(RedisNames.NOTE_STATS, note.noteId));
    });

    const cacheNstats = await this.redisService.hmgetall(nstatKeys);
    const noteStats = [];

    cacheNstats.forEach(stat => {
      noteStats.push(UtilsService.arrayToObject(stat));
    });

    return noteStats;
  }

  /**
   * 新建点位文章
   * @notes 创建点位文章后，点位收藏默认为自己的，即ownType = SAVE_FIND
   */
  async createOne(cDto: PointNoteCreateDTO): Promise<any> {
    const pointAlias = 'point',
      psaveAlias = 'psave';
    let {
      psaveId,
      userId,
      title,
      content,
      medias,
      scenes,
      blLink,
      wbLink,
      xhsLink,
      isRecom,
    } = cDto;
    let entity: any;

    const queryFields = [
      `${psaveAlias}.ffpsaveId`,
      `${psaveAlias}.fpsaveId`,
      `${psaveAlias}.name`,
      `${psaveAlias}.logo`,
      `${psaveAlias}.tag`,
      `${psaveAlias}.price`,
      `${psaveAlias}.ownType`,
      `${psaveAlias}.userId`,
      `${psaveAlias}.pointId`,
      `${pointAlias}.code`,
      `${psaveAlias}.price`,
    ];

    const where = `${psaveAlias}.psaveId = ${psaveId}`;
    let pointsave: any = await this.connection
      .createQueryBuilder(PointSaveEntity, psaveAlias)
      .innerJoinAndMapOne(
        `${psaveAlias}.point`,
        MapPointEntity,
        pointAlias,
        `${psaveAlias}.pointId = ${pointAlias}.pointId`,
      )
      .select(queryFields)
      .where(where)
      .getOne();
    const adcode = pointsave.point.code;
    const orgUserId = pointsave.userId;

    const newPointSave = await this.connection
      .getRepository(PointSaveEntity)
      .findOne(
        { userId, pointId: pointsave.pointId },
        { select: ['psaveId', 'ownType'] },
      );

    if (this.configService.get(ConfigNamespaces.APP).env === SystemEnvironments.PROD) {
      await this.wechatService.msgSecCheck({
        code: WechatMiniTypes.USER,
        content: title + content,
      });
    }

    const key = UtilsService.format(RedisNames.USER_ADD_NOTE_LOCKED, userId, psaveId);
    try {
      if (!(await this.redisService.lock(key))) {
        return;
      }
      await this.connection.transaction('READ COMMITTED', async txEntityManager => {
        //如果是公共地图，则创建一个新的点位收藏
        if (orgUserId === PUBLIC_MAP_USER_ID && !newPointSave) {
          pointsave.userId = userId;
          pointsave.ownType = PointOwnTypes.SAVE_FIND;
          const newsave = await txEntityManager.save(pointsave);
          await this.psaveService.updateNumber(txEntityManager, newsave);
          await PointUtilsService.incrementPCP(txEntityManager, userId, adcode);
          psaveId = newsave.psaveId;
        } else {
          psaveId = newPointSave.psaveId;
        }

        //创建文章
        const pointnote = new PointNoteEntity();
        pointnote.title = title;
        pointnote.userId = userId;
        pointnote.psaveId = psaveId;
        pointnote.content = content;
        medias ? (pointnote.medias = medias) : null;
        scenes ? (pointnote.scenes = scenes) : null;
        blLink ? (pointnote.blLink = blLink) : null;
        wbLink ? (pointnote.wbLink = wbLink) : null;
        xhsLink ? (pointnote.xhsLink = xhsLink) : null;
        if (orgUserId === PUBLIC_MAP_USER_ID) {
          pointnote.isAudit = true;
        }
        entity = await txEntityManager.save(pointnote);
        const nstat = new NoteStatEntity();
        nstat.noteId = entity.noteId;
        await txEntityManager.save(nstat);

        //更新点位收藏信息
        const updateSave: any = {
          noteId: entity.noteId,
          isToped: false,
        };

        if (orgUserId !== PUBLIC_MAP_USER_ID) {
          if (pointsave.ownType === PointOwnTypes.ONLY_SAVE) {
            updateSave.ownType = PointOwnTypes.SAVE_FIND;
            await txEntityManager.increment(UserEntity, { userId }, 'createPoints', 1);
            await txEntityManager.decrement(UserEntity, { userId }, 'savePoints', 1);
          }
          await txEntityManager.update(
            PointSaveEntity,
            { fpsaveId: psaveId, topNoteId: 0, isToped: false },
            { topNoteId: entity.noteId },
          );
        } else if (newPointSave && newPointSave.ownType === PointOwnTypes.ONLY_SAVE) {
          updateSave.ownType = PointOwnTypes.SAVE_FIND;
          await txEntityManager.increment(UserEntity, { userId }, 'createPoints', 1);
          await txEntityManager.decrement(UserEntity, { userId }, 'savePoints', 1);
        }
        await txEntityManager.update(PointSaveEntity, { psaveId, userId }, updateSave);

        if (isRecom) {
          const recomm = await txEntityManager.findOne(UserRecommendEntity, {
            psaveId,
            noteId: entity.noteId,
          });
          if (!recomm) {
            const newRecomm = new UserRecommendEntity();
            newRecomm.noteId = entity.noteId;
            newRecomm.psaveId = entity.psaveId;
            await txEntityManager.save(newRecomm);
          }
        }
      });

      if (orgUserId === PUBLIC_MAP_USER_ID) {
        entity.newPsaveId = psaveId;
      }

      return entity;
    } catch (err) {
      const dupEntry = 'ER_DUP_ENTRY';
      Logger.error(err.message, PointNoteService.name);
      if (err.message.search(dupEntry) === 0) {
        throw new ForbiddenException(ERRORS.POINT_NOTE_DUP);
      }
      throw err;
    } finally {
      await this.redisService.unlock(key);
    }
  }

  /**
   * 更新点位文章信息
   */
  async updateOne(
    findData: FindConditions<PointNoteEntity>,
    uDto: PointNoteUpdateDTO,
  ): Promise<any> {
    const entity: any = uDto;
    const { noteId } = findData;
    let content;
    uDto.title ? (content += uDto.title) : null;
    uDto.content ? (content += uDto.content) : null;

    if (
      this.configService.get(ConfigNamespaces.APP).env === SystemEnvironments.PROD &&
      content
    ) {
      await this.wechatService.msgSecCheck({ code: WechatMiniTypes.USER, content });
    }

    const isSucceed = await this.update(findData, entity);
    if (isSucceed) {
      const entity = await this.findOne(findData);
      await this.cache(Number(noteId), entity);
    }
    return isSucceed;
  }

  /**
   * 获取点位文章信息
   */
  async getOne(
    findData: FindConditions<PointNoteEntity>,
    fields: any[] = snFields,
  ): Promise<any> {
    let note: any = await this.getByCache(Number(findData.noteId));
    if (UtilsService.emptyObject(note)) {
      note = await this.findOneNotException({ noteId: findData.noteId }, fields);
      if (!note) {
        return null;
      }

      await this.cache(Number(findData.noteId), note);
    }

    await this.nstatService.updateStat(Number(findData.noteId), NoteStatFields.VIEWS, 1);
    await this.ustatService.updateStat(note.userId, UserStatFields.NOTE_VIEWS, 1);

    const noteStat = await this.nstatService.getOne({ noteId: findData.noteId });
    Object.assign(note, noteStat);
    const notelike = await this.nstatService.getLike(
      Number(findData.userId),
      Number(findData.noteId),
    );
    if (notelike) {
      note.isLiked = true;
    } else {
      note.isLiked = false;
    }

    if (Number(findData.userId) !== note.userId) {
      //检查文章是否收藏
      const notesave = await this.connection
        .getRepository(NoteSaveEntity)
        .findOne(findData, { select: ['nsId'] });

      if (notesave) {
        note.isSaved = true;
      } else {
        note.isSaved = false;
      }
    } else {
      //在别人的地图上面查看到自己的文章
      note.isMy = true;
    }

    //获取文章对应的点位收藏LOGO等信息
    const ppoint = await this.psaveService.getOneWithDeleted(
      { noteId: Number(findData.noteId) },
      ['logo', 'tag', 'price'],
    );

    return Object.assign(note, ppoint);
  }

  /**
   * 获取点位文章列表信息
   */
  async getSome(gDto: PointNoteGetsDTO): Promise<any> {
    const noteAlias = 'note',
      psaveAlias = 'save',
      userAlias = 'user',
      noteStatAlias = 'nstat';

    const queryFields = [
      `${noteAlias}.title`,
      `${noteAlias}.medias`,
      `${noteAlias}.content`,
      `${noteAlias}.psaveId`,
      `${noteAlias}.userId`,
      `${noteAlias}.noteId`,
      `${noteAlias}.updatedAt`,
      `${psaveAlias}.tag`,
      `${psaveAlias}.logo`,
      `${psaveAlias}.price`,
      `${psaveAlias}.psaveId`,
      `${userAlias}.avatarUrl`,
      `${userAlias}.nickName`,
      `${noteStatAlias}.views`,
      `${noteStatAlias}.tops`,
    ];
    const notes: any = await this.connection
      .createQueryBuilder(PointNoteEntity, noteAlias)
      .innerJoinAndMapOne(
        `${noteAlias}.psave`,
        PointSaveEntity,
        psaveAlias,
        `${psaveAlias}.psaveId = ${noteAlias}.psaveId`,
      )
      .innerJoinAndMapOne(
        `${noteAlias}.nstat`,
        NoteStatEntity,
        noteStatAlias,
        `${noteStatAlias}.noteId = ${noteAlias}.noteId`,
      )
      .leftJoinAndMapOne(
        `${noteAlias}.user`,
        UserEntity,
        userAlias,
        `${userAlias}.userId = ${noteAlias}.userId`,
      )
      .select(queryFields)
      .whereInIds(gDto.idsArray)
      .orderBy(UtilsService.orderString(`${noteAlias}.noteId`, gDto.idsArray))
      .getMany();

    notes.forEach(note => {
      Object.assign(note, note.psave);
      Object.assign(note, note.user);
      Object.assign(note, note.nstat);
      delete note.psave;
      delete note.user;
      delete note.nstat;

      if (note.content && note.content.length > 95) {
        note.content = note.content.slice(0, 95) + '...';
      }

      if (note.userId === PUBLIC_MAP_USER_ID) {
        Object.assign(note, RehuoOffical);
      }
    });

    return notes;
  }

  /**
   * 删除点位文章信息
   */
  async deleteOne(findData: FindConditions<PointNoteEntity>): Promise<any> {
    const { noteId, userId } = findData;
    const pointnote: PointNoteEntity = await this.findOne({ noteId, userId }, [
      'psaveId',
    ]);
    try {
      await this.connection.transaction('READ COMMITTED', async txEntityManager => {
        //删除文章
        await txEntityManager.softDelete(PointNoteEntity, { noteId });
        await txEntityManager.update(
          PointSaveEntity,
          { psaveId: pointnote.psaveId },
          {
            noteId: 0,
          },
        );
        await txEntityManager.update(
          PointSaveEntity,
          { topNoteId: noteId },
          { topNoteId: 0, isToped: false },
        );

        await this.uncache(Number(findData.noteId));
      });
      return true;
    } catch (err) {
      throw err;
    }
  }

  /**
   * 获取自己针对某个收藏写的文章
   */
  async getOneNotException(
    findData: FindConditions<PointNoteEntity>,
    fields: any[] = snFields,
  ): Promise<any> {
    let note = await this.getByCache(Number(findData.noteId));
    if (UtilsService.emptyObject(note)) {
      note = await this.findOneNotException(findData, fields);
      if (note) {
        await this.cache(Number(findData.noteId), note);
      }
    }

    return note;
  }

  /**
   * 获取点位文章列表信息
   */
  async getMore(gDto: PointNoteGetMoreDTO): Promise<any> {
    const noteAlias = 'note',
      psaveAlias = 'save',
      noteMaskAlias = 'mask',
      ulinkAlias = 'ulink',
      userAlias = 'user',
      noteStatAlias = 'nstat';

    let queryFields = [
      `${psaveAlias}.userId`,
      `${ulinkAlias}.userId`,
      `${ulinkAlias}.followerId`,
    ];

    let pointsave = await this.psaveService.getOne({ psaveId: gDto.psaveId }, [
      'noteId',
      'topNoteId',
      'ffpsaveId',
      'pointId',
    ]);
    let where = `${psaveAlias}.psaveId = ${gDto.psaveId}`;

    //检查针对一个点位的关注关系
    const links: any = await this.connection
      .createQueryBuilder(PointSaveEntity, psaveAlias)
      .leftJoinAndMapMany(
        `${psaveAlias}.nlink`,
        UserLinkEntity,
        ulinkAlias,
        `${psaveAlias}.userId = ${ulinkAlias}.userId`,
      )
      .select(queryFields)
      .where(where)
      .limit(20)
      .getOne();

    if (
      !links ||
      (links.nlink.length === 0 && pointsave.noteId === 0 && pointsave.topNoteId === 0)
    ) {
      return {
        page: new PageResponseInternalDTO(0, 0, 0),
        notes: [],
      };
    }

    let noteIds = [];
    pointsave.noteId > 0 ? noteIds.push(pointsave.noteId) : null;
    pointsave.topNoteId > 0 ? noteIds.push(pointsave.topNoteId) : null;

    //查看该点位的文章被收藏
    const notesaves = await this.connection
      .getRepository(NoteSaveEntity)
      .find({ where: { psaveId: gDto.psaveId }, select: ['noteId'] });
    notesaves.forEach(save => {
      noteIds.push(save.noteId);
    });

    let saves: any = [];
    if (links.nlink.length > 0) {
      let followerIds = '(';
      links.nlink.forEach(nlink => {
        followerIds += nlink.followerId + ',';
      });
      followerIds = followerIds.substr(0, followerIds.length - 1) + ')';
      queryFields = [`${psaveAlias}.noteId`];

      //获取关注者针对点位的收藏列表信息
      where = `(${psaveAlias}.ffpsaveId = ${pointsave.ffpsaveId} or ${psaveAlias}.pointId = ${pointsave.pointId}) and ${psaveAlias}.noteId != 0 and ${psaveAlias}.userId IN ${followerIds}`;
      saves = await this.connection
        .createQueryBuilder(PointSaveEntity, psaveAlias)
        .select(queryFields)
        .where(where)
        .limit(20)
        .getMany();

      saves.forEach(save => {
        noteIds.push(save.noteId);
      });
    }

    if (noteIds.length === 0) {
      return {
        page: new PageResponseInternalDTO(0, 0, 0),
        notes: [],
      };
    }

    noteIds = UtilsService.ARFA(noteIds);
    //处理文章屏蔽
    queryFields = [`${noteMaskAlias}.noteId`];
    where = `${noteMaskAlias}.userId = ${gDto.userId} and ${noteMaskAlias}.psaveId = ${gDto.psaveId}`;
    const maskNoteIds = await this.connection
      .createQueryBuilder(NoteMaskEntity, noteMaskAlias)
      .where(where)
      .select(queryFields)
      .limit(20)
      .getMany();
    if (maskNoteIds.length > 0) {
      for (let i = 0; i < maskNoteIds.length; i++) {
        for (let j = 0; j < noteIds.length; j++) {
          if (noteIds[j] === maskNoteIds[i].noteId) {
            noteIds.splice(j, 1);
            break;
          }
        }
      }
    }

    if (noteIds.length === 0) {
      return {
        page: new PageResponseInternalDTO(0, 0, 0),
        notes: [],
      };
    }

    queryFields = [
      `${noteAlias}.title`,
      `${noteAlias}.medias`,
      `${noteAlias}.content`,
      `${noteAlias}.psaveId`,
      `${noteAlias}.userId`,
      `${noteAlias}.noteId`,
      `${noteAlias}.updatedAt`,
      `${userAlias}.avatarUrl`,
      `${userAlias}.nickName`,
      `${noteStatAlias}.views`,
      `${noteStatAlias}.tops`,
      `${psaveAlias}.tag`,
      `${psaveAlias}.logo`,
      `${psaveAlias}.price`,
      `${psaveAlias}.psaveId`,
    ];
    const notes: any = await this.connection
      .createQueryBuilder(PointNoteEntity, noteAlias)
      .innerJoinAndMapOne(
        `${noteAlias}.psave`,
        PointSaveEntity,
        psaveAlias,
        `${psaveAlias}.psaveId = ${noteAlias}.psaveId`,
      )
      .innerJoinAndMapOne(
        `${noteAlias}.nstat`,
        NoteStatEntity,
        noteStatAlias,
        `${noteStatAlias}.noteId = ${noteAlias}.noteId`,
      )
      .leftJoinAndMapOne(
        `${noteAlias}.user`,
        UserEntity,
        userAlias,
        `${userAlias}.userId = ${noteAlias}.userId`,
      )
      .select(queryFields)
      .whereInIds(noteIds)
      .skip(gDto.start)
      .take(gDto.take)
      .orderBy(`${noteAlias}.updatedAt`, gDto.order)
      .getMany();

    const nstatKeys = [];
    notes.forEach(note => {
      nstatKeys.push(UtilsService.format(RedisNames.NOTE_STATS, note.noteId));
    });

    const cacheNstats = await this.redisService.hmgetall(nstatKeys);
    notes.forEach((note, index) => {
      const nstat: any = UtilsService.arrayToObject(cacheNstats[index]);
      if (nstat) {
        note.nstat = nstat;
      }
    });

    notes.forEach(note => {
      Object.assign(note, note.psave);
      Object.assign(note, note.user);
      Object.assign(note, note.nstat);
      delete note.psave;
      delete note.user;
      delete note.nstat;

      if (note.content && note.content.length > 95) {
        note.content = note.content.slice(0, 95) + '...';
      }

      if (note.userId === PUBLIC_MAP_USER_ID) {
        Object.assign(note, RehuoOffical);
      }
    });

    return {
      page: new PageResponseInternalDTO(gDto.start, notes.length, saves.length),
      notes,
    };
  }

  /**
   * 收藏文章
   */
  async save(cDto: PointNoteSaveDTO): Promise<any> {
    const { noteId, userId } = cDto;
    const noteAlias = 'note',
      psaveAlias = 'save';

    const where = `${noteAlias}.noteId = ${noteId}`;
    const queryFields = [
      `${noteAlias}.psaveId`,
      `${noteAlias}.userId`,
      `${psaveAlias}.pointId`,
    ];

    const note: any = await this.connection
      .createQueryBuilder(PointNoteEntity, noteAlias)
      .innerJoinAndMapOne(
        `${noteAlias}.save`,
        PointSaveEntity,
        psaveAlias,
        `${psaveAlias}.psaveId = ${noteAlias}.psaveId`,
      )
      .select(queryFields)
      .where(where)
      .getOne();

    if (!note || !note.save || !note.save.pointId) {
      throw new BadRequestException(ERRORS.PARAMS_INVALID);
    }

    //自己不允许收藏自己的文章
    if (note.userId === userId) {
      throw new BadRequestException(ERRORS.PARAMS_INVALID);
    }

    //检查是否已经收藏了该文章对应的点位
    const oldsave = await this.psaveService.findOneNotException(
      { userId, pointId: note.save.pointId },
      ['psaveId'],
    );

    let newsave;
    const key = UtilsService.format(RedisNames.NOTE_SAVE_LOCKED, noteId, userId);
    try {
      if (!(await this.redisService.lock(key))) {
        return;
      }
      await this.connection.transaction('READ COMMITTED', async txEntityManager => {
        if (oldsave) {
          await txEntityManager.update(
            PointSaveEntity,
            { psaveId: oldsave.psaveId },
            { topNoteId: noteId },
          );
        } else {
          const psaveAlias = 'psave',
            pointAlias = 'point';
          const queryFields = [
            `${psaveAlias}.name`,
            `${psaveAlias}.tag`,
            `${psaveAlias}.logo`,
            `${psaveAlias}.price`,
            `${psaveAlias}.pointId`,
            `${psaveAlias}.ffpsaveId`,
            `${psaveAlias}.userId`,
            `${psaveAlias}.topNoteId`,
            `${psaveAlias}.noteId`,
            `${pointAlias}.code`,
          ];
          const where = `${psaveAlias}.psaveId = ${note.psaveId}`;

          const pointsave: any = await txEntityManager
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

          //收藏点位信息
          const save = new PointSaveEntity();
          save.sortId = 0;
          save.name = pointsave.name;
          save.tag = pointsave.tag;
          save.logo = pointsave.logo;
          save.price = pointsave.price;
          save.pointId = pointsave.pointId;
          save.fpsaveId = note.psaveId;
          save.ffpsaveId = pointsave.ffpsaveId;
          save.ownType = PointOwnTypes.ONLY_SAVE;
          save.userId = userId;
          if (pointsave.isToped) {
            save.topNoteId = pointsave.topNoteId;
          } else {
            save.topNoteId =
              pointsave.noteId > 0 ? pointsave.noteId : pointsave.topNoteId;
          }
          newsave = await txEntityManager.save(PointSaveEntity, save);

          await this.psaveService.updateNumber(txEntityManager, newsave);
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
        }

        const psaveId = oldsave ? oldsave.psaveId : newsave.psaveId;
        //创建文章收藏
        await txEntityManager.save(NoteSaveEntity, {
          userId,
          psaveId,
          noteId,
        });

        //删除文章屏蔽
        await txEntityManager.delete(NoteMaskEntity, { psaveId, ...cDto });

        if (!oldsave) {
          const point = txEntityManager.findOne(
            MapPointEntity,
            { pointId: newsave.pointId },
            {
              select: ['longitude', 'latitude', 'address'],
            },
          );

          return Object.assign(newsave, point);
        }
        return null;
      });
      if (!oldsave) {
        const message: ISaveMessage = {
          userId,
          noteId,
          psaveId: note.psaveId,
          type: MessageReturnTypes.SAVE_NOTE,
        };
        await this.msgService.message(note.userId, message, MessageQueryTypes.SAVETOP);
      }
    } catch (err) {
      const dupEntry = 'ER_DUP_ENTRY';
      Logger.error(err.message, PointNoteService.name);
      if (err.message.search(dupEntry) === 0) {
        throw new ForbiddenException(ERRORS.NOTESAVE_DUP);
      }
      throw err;
    } finally {
      await this.redisService.unlock(key);
    }
  }

  /**
   * 文章取消收藏
   */
  async unsave(dDto: PointNoteSaveDTO): Promise<boolean> {
    const { noteId, userId } = dDto;
    const key = UtilsService.format(RedisNames.NOTE_SAVE_LOCKED, noteId, userId);
    const notesave = await this.connection
      .getRepository(NoteSaveEntity)
      .findOne(dDto, { select: ['nsId', 'psaveId'] });
    let pointsave, adcode;
    if (notesave) {
      const psaveAlias = 'psave',
        pointAlias = 'point';
      const queryFields = [
        `${psaveAlias}.topNoteId`,
        `${psaveAlias}.ownType`,
        `${psaveAlias}.sortId`,
        `${psaveAlias}.pointId`,
        `${psaveAlias}.ffpsaveId`,
        `${pointAlias}.code`,
      ];
      const where = `${psaveAlias}.userId = ${userId} and ${psaveAlias}.psaveId = ${notesave.psaveId}`;
      pointsave = await this.connection
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
      adcode = pointsave.point.code;
    }

    try {
      let isSucceed = true;
      if (!(await this.redisService.lock(key))) {
        return;
      }
      await this.connection.transaction('READ COMMITTED', async txEntityManager => {
        if (notesave) {
          const result: DeleteResult = await txEntityManager.delete(NoteSaveEntity, dDto);
          if (result.affected !== 0) {
            await txEntityManager.save(NoteMaskEntity, {
              ...dDto,
              psaveId: notesave.psaveId,
            });
            isSucceed = true;
          } else {
            isSucceed = false;
          }
          if (isSucceed && pointsave.topNoteId > 0) {
            const notesaves = await txEntityManager.find(NoteSaveEntity, {
              where: {
                userId: dDto.userId,
                psaveId: notesave.psaveId,
              },
              order: {
                nsId: SqlOrderTypes.DESC,
              },
              select: ['noteId'],
            });

            await txEntityManager.update(
              PointSaveEntity,
              { psaveId: notesave.psaveId },
              { topNoteId: notesaves.length > 0 ? notesaves[0].noteId : 0 },
            );

            if (notesaves.length === 0) {
              if (pointsave.ownType !== PointOwnTypes.ONLY_SAVE) {
                return;
              }
              await txEntityManager.decrement(UserEntity, { userId }, 'savePoints', 1);
              await txEntityManager.decrement(
                PointSaveStatEntity,
                { psaveId: pointsave.ffpsaveId },
                'saves',
                1,
              );
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

              await txEntityManager.delete(UserClockEntity, {
                userId,
                pointId: pointsave.pointId,
              });
              await txEntityManager.softDelete(PointSaveEntity, {
                psaveId: notesave.psaveId,
              });
              await PointUtilsService.decrementPCP(txEntityManager, userId, adcode);
            }
          }
        }
      });

      return isSucceed;
    } catch (err) {
      throw err;
    } finally {
      await this.redisService.unlock(key);
    }
  }

  /**
   * 获取点位文章列表信息
   */
  async getAll(gDto: PointNoteGetAllDTO): Promise<any> {
    const noteAlias = 'note',
      userAlias = 'user';

    const where = `${noteAlias}.isAudit = ${gDto.isAudit}`;
    const queryFields = [
      `${noteAlias}.noteId`,
      `${noteAlias}.title`,
      `${noteAlias}.userId`,
      `${noteAlias}.updatedAt`,
      `${userAlias}.nickName`,
      `${userAlias}.avatarUrl`,
    ];
    const [notes, noteCounts] = await this.connection
      .createQueryBuilder(PointNoteEntity, noteAlias)
      .innerJoinAndMapOne(
        `${noteAlias}.user`,
        UserEntity,
        userAlias,
        `${userAlias}.userId = ${noteAlias}.userId`,
      )
      .select(queryFields)
      .where(where)
      .skip(gDto.start)
      .take(gDto.take)
      .orderBy(`${noteAlias}.updatedAt`, gDto.order)
      .getManyAndCount();

    notes.forEach((note: any) => {
      Object.assign(note, note.user);
      delete note.user;
      delete note.userId;
    });

    const page = new PageResponseInternalDTO(gDto.start, notes.length, noteCounts);
    return {
      notes,
      page,
    };
  }

  /**
   * 获取点位文章的简略信息
   */
  async getSimple(findData: FindConditions<PointNoteEntity>): Promise<any> {
    return this.findOne({ noteId: findData.noteId }, [
      'noteId',
      'updatedAt',
      'title',
      'content',
      'medias',
    ]);
  }

  /**
   * 审核文章
   */
  async audit(noteId: number): Promise<any> {
    return this.update({ noteId }, { isAudit: true });
  }
}
