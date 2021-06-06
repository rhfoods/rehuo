import { number, string } from '@hapi/joi';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { PUBLIC_MAP_USER_ID } from '@rehuo/common/constants/map.constant';
import {
  MessageReturnTypes,
  MessageQueryTypes,
  SystemMessageTypes,
} from '@rehuo/common/constants/message.constant';
import { HintUserFields, RedisNames } from '@rehuo/common/constants/redis.constant';
import { RehuoOffical } from '@rehuo/common/constants/rehuo.constant';
import { DBNAME } from '@rehuo/common/constants/sql.constant';
import { TIME } from '@rehuo/common/constants/system.constant';
import { DBService } from '@rehuo/common/db/db.service';
import { PageResponseInternalDTO } from '@rehuo/common/dtos/page.response.dto';
import { IBaseMessage, ISystemMessage } from '@rehuo/common/interfaces/message.interface';
import { UtilsService } from '@rehuo/common/providers/utils.service';
import { HintService } from '@rehuo/hint/hint.service';
import { NoteCommentService } from '@rehuo/map/modules/point/modules/note/services/note.comment.service';
import { PointNoteService } from '@rehuo/map/modules/point/modules/note/services/point.note.service';
import { PointSaveService } from '@rehuo/map/modules/point/modules/save/point.save.service';
import { PointSortService } from '@rehuo/map/modules/point/modules/sort/point.sort.service';
import { CommentLikeEntity } from '@rehuo/models/comment.like.entity';
import { HintUserEntity } from '@rehuo/models/hint.user.entity';
import { MessageEntity } from '@rehuo/models/message.entity';
import { NoteStatEntity } from '@rehuo/models/note.stat.entity';
import { PointNoteEntity } from '@rehuo/models/point.note.entity';
import { PointSaveEntity } from '@rehuo/models/point.save.entity';
import { UserEntity } from '@rehuo/models/user.entity';
import { UserLinkEntity } from '@rehuo/models/user.link.entity';
import { RedisService } from '@rehuo/redis/redis.service';
import { UserService } from '@rehuo/user/services/user.service';
import { Connection, MoreThan, Repository } from 'typeorm';
import {
  MessageGetNewsDTO,
  MessageGetsDTO,
  MessageReadsDTO,
} from './dtos/message.crud.dto';

@Injectable()
export class MessageService extends DBService<MessageEntity> {
  constructor(
    @InjectRepository(MessageEntity)
    private mRepo: Repository<MessageEntity>,
    @InjectConnection()
    private readonly connection: Connection,
    @Inject(forwardRef(() => HintService))
    private readonly hintService: HintService,
    @Inject(forwardRef(() => RedisService))
    private readonly redisService: RedisService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => PointSortService))
    private readonly psortService: PointSortService,
    @Inject(forwardRef(() => PointSaveService))
    private readonly psaveService: PointSaveService,
    @Inject(forwardRef(() => PointNoteService))
    private readonly pnoteService: PointNoteService,
    @Inject(forwardRef(() => NoteCommentService))
    private readonly ncommentService: NoteCommentService,
  ) {
    super(mRepo, MessageService.name);
  }

  private returnToQueryTypes(type: MessageReturnTypes): HintUserFields {
    let field;
    switch (type) {
      case MessageReturnTypes.SAVE_POINT:
      case MessageReturnTypes.SAVE_MAP:
      case MessageReturnTypes.SAVE_NOTE:
      case MessageReturnTypes.SET_TOP:
        field = HintUserFields.SAVETOPS;
        break;
      case MessageReturnTypes.CLOCK_NOTE:
      case MessageReturnTypes.CLOCK_POINT:
        field = HintUserFields.CLOCKS;
        break;
      case MessageReturnTypes.LIKE_NOTE:
      case MessageReturnTypes.LIKE_COMMENT:
        field = HintUserFields.LIKES;
        break;
      case MessageReturnTypes.COMMENT_NOTE:
      case MessageReturnTypes.COMMENT_COMMENT:
        field = HintUserFields.COMMENTS;
        break;
      case MessageReturnTypes.SYSTEM:
        field = HintUserFields.SYSTEMS;
        break;
      default:
        throw new Error(`invalid Message Type: ${type}`);
    }

    return field;
  }

  private convertQueryTypes(type: MessageQueryTypes): HintUserFields {
    let field;
    switch (type) {
      case MessageQueryTypes.SAVETOP:
        field = HintUserFields.SAVETOPS;
        break;
      case MessageQueryTypes.CLOCK:
        field = HintUserFields.CLOCKS;
        break;
      case MessageQueryTypes.LIKE:
        field = HintUserFields.LIKES;
        break;
      case MessageQueryTypes.COMMENT:
        field = HintUserFields.COMMENTS;
        break;
      case MessageQueryTypes.SYSTEM:
        field = HintUserFields.SYSTEMS;
        break;
      default:
        throw new Error(`invalid Message Type: ${type}`);
    }

    return field;
  }

  /**
   * 更新提示消息数据库和缓存
   */
  private async updateHint(userId: number, hints: any): Promise<any> {
    const hint = await this.connection.getRepository(HintUserEntity).findOne({
      where: { userId },
    });
    const newHint = {
      savetops: hint.savetops - hints.savetops >= 0 ? hint.savetops - hints.savetops : 0,
      clocks: hint.clocks - hints.clocks >= 0 ? hint.clocks - hints.clocks : 0,
      likes: hint.likes - hints.likes >= 0 ? hint.likes - hints.likes : 0,
      comments: hint.comments - hints.comments >= 0 ? hint.comments - hints.comments : 0,
      systems: hint.systems - hints.systems >= 0 ? hint.systems - hints.systems : 0,
    };
    await this.connection.getRepository(HintUserEntity).update({ userId }, newHint);
    const key = UtilsService.format(RedisNames.HINT_USER, userId);
    await this.redisService.hmset(key, newHint);
  }

  /**
   * 获取消息
   */
  async get(gDto: MessageGetsDTO): Promise<any> {
    const mgsAlias = `message`;
    const messageQuerys = [
      `${mgsAlias}.msgId`,
      `${mgsAlias}.createdAt`,
      `${mgsAlias}.isRead`,
      `${mgsAlias}.content`,
      `${mgsAlias}.type`,
    ];

    const where = gDto.type
      ? `${mgsAlias}.type = '${gDto.type}' and ${mgsAlias}.userId = ${gDto.userId}`
      : `${mgsAlias}.userId = ${gDto.userId}`;
    let messages: any, messageCounts;
    [messages, messageCounts] = await this.connection
      .createQueryBuilder(MessageEntity, mgsAlias)
      .select(messageQuerys)
      .skip(gDto.start)
      .where(where)
      .take(gDto.take)
      .orderBy(`${mgsAlias}.msgId`, gDto.order)
      .getManyAndCount();

    const page = new PageResponseInternalDTO(gDto.start, messages.length, messageCounts);
    const hintUserCounts = {
      savetops: 0,
      clocks: 0,
      likes: 0,
      comments: 0,
      systems: 0,
    };
    for (let i = 0; i < messages.length; i++) {
      if (!messages[i].isRead) {
        await this.connection
          .getRepository(MessageEntity)
          .update({ msgId: messages[i].msgId }, { isRead: true });
        hintUserCounts[this.convertQueryTypes(messages[i].type)]++;
      }
      Object.assign(messages[i], messages[i].content);
      delete messages[i].content;

      if (
        messages[i].type &&
        (messages[i].type === MessageReturnTypes.COMMENT_COMMENT ||
          messages[i].type === MessageReturnTypes.COMMENT_NOTE)
      ) {
        const like = await this.connection.getRepository(CommentLikeEntity).findOne({
          where: { userId: gDto.userId, commentId: messages[i].commentId },
          select: ['nlId'],
        });
        messages[i].isLiked = like ? true : false;
      }
    }

    await this.updateHint(gDto.userId, hintUserCounts);

    return {
      page,
      messages,
    };
  }

  /**
   * 获取地图分类名称
   */
  private async mapName(sortId: number): Promise<string> {
    if (sortId === -1) {
      return '所有的发现';
    }
    if (sortId === 0) {
      return '缺省分类';
    }

    const sort = await this.psortService.findOne({ sortId }, ['name']);
    return sort.name;
  }

  /**
   * 获取点位名称
   */
  private async pointName(psaveId: number): Promise<string> {
    const psave = await this.psaveService.findOne({ psaveId }, ['name']);
    return psave.name;
  }

  /**
   * 获取文章title和media
   */
  private async noteTitleAndMedia(noteId: number): Promise<any> {
    const psave = await this.pnoteService.findOne({ noteId }, ['title', 'medias']);

    return {
      title: psave.title,
      media: psave.medias[0],
    };
  }

  /**
   * 获取评论信息
   */
  private async commentContent(
    userId: number,
    commentId: number,
    fCommentId?: number,
  ): Promise<any> {
    const ids = [commentId];
    fCommentId ? ids.push(fCommentId) : null;

    const comments = await this.ncommentService.findByIds(ids, ['comment', 'commentId']);
    const commentLike = await this.connection
      .getRepository(CommentLikeEntity)
      .findOne({ userId, commentId });
    const ret: any = {
      isLiked: commentLike ? true : false,
    };
    if (fCommentId) {
      if (commentId === comments[0].commentId) {
        ret.comment = comments[0].comment;
        ret.fComment = comments[1].comment;
      } else {
        ret.comment = comments[1].comment;
        ret.fComment = comments[0].comment;
      }
    } else {
      ret.comment = comments[0].comment;
    }

    return ret;
  }

  /**
   * 对消息进行格式化
   */
  private async format<T extends IBaseMessage | ISystemMessage>(
    userId: number,
    content: T,
  ): Promise<any> {
    const obj: any = { ...content };
    const user = await this.userService.getOne({ userId: content.userId });
    obj.nickName = user.nickName;
    obj.avatarUrl = user.avatarUrl;

    if (content.hasOwnProperty('sortId')) {
      obj.sortName = await this.mapName(content['sortId']);
    }

    if (content.hasOwnProperty('psaveId')) {
      obj.name = await this.pointName(content['psaveId']);
    }

    if (content.hasOwnProperty('noteId')) {
      const { title, media } = await this.noteTitleAndMedia(content['noteId']);
      obj.title = title;
      obj.media = media;
    }

    if (content.hasOwnProperty('commentId')) {
      let fCommentId;
      if (content['upId'] && content['fatherId']) {
        fCommentId = content['upId'];
      } else if (content['fatherId'] && !content['upId']) {
        fCommentId = content['fatherId'];
      } else {
        fCommentId = null;
      }
      const { comment, fComment, isLiked } = await this.commentContent(
        userId,
        content['commentId'],
        fCommentId,
      );
      obj.comment = comment.length > 100 ? comment.slice(0, 96) + '...' : comment;
      if (fComment) {
        obj.fComment = fComment.length > 100 ? fComment.slice(0, 96) + '...' : fComment;
      }
      obj.isLiked = isLiked;
    }

    return obj;
  }

  /**
   * 生成用户消息
   */
  async message<T extends IBaseMessage | ISystemMessage>(
    userId: number,
    content: T,
    type: MessageQueryTypes,
  ): Promise<any> {
    if (userId === 0) {
      return;
    }

    const message = new MessageEntity();
    message.type = type;
    message.userId = userId;
    message.content =
      type === MessageQueryTypes.SYSTEM
        ? await this.formatSystem(content)
        : await this.format(userId, content);

    const field = this.convertQueryTypes(type);

    const result = await this.create(message);
    if (result) {
      await this.hintService.updateHints(userId, field);
    }
  }

  /**
   * 格式化点位推荐的反馈信息
   */
  private sysMsgPointRecommendReturns(content: ISystemMessage) {
    const passedStr = `您推荐的"${content.name}"已通过审核，我们将在公共地图中展示`;
    const unpassedStr = `抱歉！您推荐的"${content.name}"未通过审核，原因是:${content.description}`;

    return content.isPassed
      ? {
        tag: '审核通过',
        description: passedStr,
      }
      : {
        tag: '审核未通过',
        description: unpassedStr,
      };
  }

  /**
   * 格式化用户给博主发送的点位推荐信息
   */
  private async sysMsgPointRecommendUsers(content: ISystemMessage): Promise<any> {
    const user = await this.connection.getRepository(UserEntity)
      .findOne({ userId: content.userId }, { select: ['nickName'] });

    const nickName = user ? user.nickName : '';
    const sysStr = `您的粉丝${nickName}向您推荐好店:${content.name}，地址:${content.address}`;

    return {
      tag: '粉丝推荐',
      description: sysStr,
    }
  }

  /**
   * 用户首次登录系统消息
   */
  private sysMsgFirstLoginned(content: ISystemMessage): any {
    return {
      tag: '关注公众号',
      description: '点击关注公众号，获得实时打卡、评论点赞信息！不错过与朋友的每一次互动哦！'
    }
  }

  /**
   * 格式化系统消息
   */
  async formatSystem(content: ISystemMessage | any): Promise<any> {
    let res = {};

    switch (content.type) {
      case SystemMessageTypes.POINT_RECOMMENDS:
        res = this.sysMsgPointRecommendReturns(content);
        break;
      case SystemMessageTypes.POINT_RECOMMEND_USERS:
        res = await this.sysMsgPointRecommendUsers(content);
        break;
      case SystemMessageTypes.FIRST_LOGINNED:
        res = this.sysMsgFirstLoginned(content);
      default:
    }

    return res;
  }

  /**
   * 获取最新动态
   */
  async getNews(gDto: MessageGetNewsDTO): Promise<any> {
    const noteAlias = 'note',
      psaveAlias = 'save',
      userAlias = 'user',
      noteStatAlias = 'nstat';

    //查询过去三十天的最新消息
    const dayAfter = new Date(
      new Date().getTime() - 30 * TIME.MAX_DAY_TIMESTAMP,
    ).toLocaleDateString();

    //获取好友列表
    const links: any = await this.connection
      .getRepository(UserLinkEntity)
      .find({ where: { userId: gDto.userId }, select: ['followerId'], take: 200 });
    let followerStrs = `(${PUBLIC_MAP_USER_ID},`;
    links.forEach(link => {
      followerStrs += link.followerId + ',';
    });

    followerStrs = followerStrs.substr(0, followerStrs.length - 1) + ')';
    const where = `${psaveAlias}.noteId != 0 and ${psaveAlias}.userId IN ${followerStrs}`;
    let queryFields = [`${psaveAlias}.noteId`, `${psaveAlias}.updatedAt`];
    const [saves, saveCounts] = await this.connection
      .createQueryBuilder(PointSaveEntity, psaveAlias)
      .select(queryFields)
      .where(where)
      .andWhere(`${psaveAlias}.updatedAt`, MoreThan(dayAfter))
      .skip(gDto.start)
      .take(gDto.take)
      .orderBy(`${psaveAlias}.updatedAt`, gDto.order)
      .getManyAndCount();

    if (saves.length === 0) {
      return {
        page: new PageResponseInternalDTO(0, 0, 0),
        notes: [],
      };
    }

    const noteIds = [];
    saves.forEach(save => {
      noteIds.push(save.noteId);
    });

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
      page: new PageResponseInternalDTO(gDto.start, notes.length, saveCounts),
      notes,
    };
  }
}
