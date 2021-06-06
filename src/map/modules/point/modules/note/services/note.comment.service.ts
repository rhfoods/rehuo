import {
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
import { NoteCommentTypes } from '@rehuo/common/constants/note.constant';
import {
  NoteCommentFields,
  NoteStatFields,
  RedisNames,
  RedisTimeouts,
} from '@rehuo/common/constants/redis.constant';
import { SqlOrderTypes } from '@rehuo/common/constants/sql.constant';
import { DBService } from '@rehuo/common/db/db.service';
import { PageResponseInternalDTO } from '@rehuo/common/dtos/page.response.dto';
import {
  ICommentMessage,
  ILikeMessage,
} from '@rehuo/common/interfaces/message.interface';
import { UtilsService } from '@rehuo/common/providers/utils.service';
import { MessageService } from '@rehuo/message/message.service';
import { CommentLikeEntity } from '@rehuo/models/comment.like.entity';
import { NoteCommentEntity } from '@rehuo/models/note.comment.entity';
import { PointNoteEntity } from '@rehuo/models/point.note.entity';
import { PointSaveEntity } from '@rehuo/models/point.save.entity';
import { UserEntity } from '@rehuo/models/user.entity';
import { RedisService } from '@rehuo/redis/redis.service';
import { Connection, Repository } from 'typeorm';
import {
  NoteCommentCreateDTO,
  NoteCommentDeleteDTO,
  NoteCommentGetAllDTO,
  NoteCommentGetSubAllDTO,
  NoteCommentLikeDTO,
} from '../dtos/note.comment.crud.dto';
import { NoteStatService } from './note.stat.service';

@Injectable()
export class NoteCommentService extends DBService<NoteCommentEntity> {
  constructor(
    @InjectRepository(NoteCommentEntity)
    private ncRepo: Repository<NoteCommentEntity>,
    @Inject(forwardRef(() => RedisService))
    private readonly redisService: RedisService,
    private readonly nstatService: NoteStatService,
    @InjectConnection()
    private readonly connection: Connection,
    @Inject(forwardRef(() => MessageService))
    private readonly msgService: MessageService,
  ) {
    super(ncRepo, NoteCommentService.name);
  }

  private async incrLikes(commentId: number): Promise<any> {
    await this.updateStat(commentId, NoteCommentFields.LIKES, 1);
  }

  private async decrLikes(commentId: number): Promise<any> {
    await this.updateStat(commentId, NoteCommentFields.LIKES, -1);
  }

  /**
   * 更新文章统计信息缓存数据
   */
  async updateStat(
    commentId: number,
    field: NoteCommentFields,
    value: number,
  ): Promise<any> {
    const key = UtilsService.format(RedisNames.COMMENT_STATS, commentId);
    const isExist = await this.redisService.exists(key);
    if (!isExist) {
      const cstat = await this.findOneNotException({ commentId }, [field]);
      await this.redisService.hmset(key, cstat, RedisTimeouts.SOMECACHE_STATS);
      await this.redisService.sadd(RedisNames.COMMENT_STAT_CHANGED, key);
    } else {
      await this.redisService.sadd(RedisNames.COMMENT_STAT_CHANGED, key);
    }
    await this.redisService.hincrby(key, field, value);
  }

  /**
   * 添加评论
   */
  async createOne(cDto: NoteCommentCreateDTO): Promise<any> {
    const { noteId, fatherId, upId, type, userId } = cDto;
    let entity, fComment;
    const note = await this.connection
      .getRepository(PointNoteEntity)
      .findOne({ where: { noteId }, select: ['userId', 'psaveId'] });
    if (!note) {
      throw new ForbiddenException(ERRORS.POINTNOTE_NOEXIST);
    }

    const key = UtilsService.format(RedisNames.NOTE_COMMENT_LOCKED, userId, noteId);
    try {
      if (!(await this.redisService.lock(key))) {
        return;
      }
      const message: ICommentMessage | any = {
        userId,
        noteId,
        psaveId: note.psaveId,
      };

      await this.connection.transaction('READ COMMITTED', async txEntityManager => {
        //创建评论
        const comment = new NoteCommentEntity();

        comment.noteId = noteId;
        comment.userId = userId;
        comment.type = type;
        if (type === NoteCommentTypes.ANSWER) {
          comment.fatherId = fatherId;
          message.fatherId = fatherId;
          message.cType = NoteCommentTypes.ANSWER;
          message.type = MessageReturnTypes.COMMENT_COMMENT;
          fComment = await txEntityManager
            .getRepository(NoteCommentEntity)
            .findOne({ where: { commentId: fatherId }, select: ['userId'] });
        } else if (type === NoteCommentTypes.REPLY) {
          comment.upId = upId;
          comment.fatherId = fatherId;
          message.upId = upId;
          message.fatherId = fatherId;
          message.cType = NoteCommentTypes.REPLY;
          message.type = MessageReturnTypes.COMMENT_COMMENT;
          fComment = await txEntityManager
            .getRepository(NoteCommentEntity)
            .findOne({ where: { commentId: upId }, select: ['userId'] });
        } else {
          message.type = MessageReturnTypes.COMMENT_NOTE;
          message.cType = NoteCommentTypes.QUESTION;
        }

        /**
         * 增加子评论条数
         */
        if (type !== NoteCommentTypes.QUESTION) {
          await txEntityManager.increment(
            NoteCommentEntity,
            { commentId: fatherId },
            'aCounts',
            1,
          );
        }

        comment.comment = cDto.comment;
        entity = await txEntityManager.save(comment);
      });
      const toUserId = fComment ? fComment.userId : note.userId;
      message.commentId = entity.commentId;
      await this.msgService.message(toUserId, message, MessageQueryTypes.COMMENT);
      await this.nstatService.updateStat(noteId, NoteStatFields.COMMENTS, 1);
      return entity;
    } catch (err) {
      throw err;
    } finally {
      await this.redisService.unlock(key);
    }
  }

  /**
   * 删除评论
   */
  async deleteOne(dDto: NoteCommentDeleteDTO): Promise<any> {
    const { commentId, noteId } = dDto;
    const key = UtilsService.format(RedisNames.NOTE_COMMENT_LOCKED, noteId, commentId);
    try {
      if (!(await this.redisService.lock(key))) {
        return 0;
      }
      const comment = await this.findOneNotException(dDto, ['type', 'upId', 'fatherId']);
      if (!comment) {
        return 0;
      }
      let deletedCounts = 0;
      await this.connection.transaction('READ COMMITTED', async txEntityManager => {
        let result;

        if (comment.type === NoteCommentTypes.QUESTION) {
          result = await txEntityManager.delete(NoteCommentEntity, { commentId });
          deletedCounts += result.affected;
          result = await txEntityManager.delete(NoteCommentEntity, {
            fatherId: commentId,
          });
          deletedCounts += result.affected;
        } else if (comment.type === NoteCommentTypes.ANSWER) {
          result = await txEntityManager.delete(NoteCommentEntity, { commentId });
          deletedCounts += result.affected;
          result = await txEntityManager.delete(NoteCommentEntity, { upId: commentId });
          deletedCounts += result.affected;
        } else {
          result = await txEntityManager.delete(NoteCommentEntity, { commentId });
          deletedCounts += result.affected;
        }

        /**
         * 减少子评论条数
         */
        if (comment.type !== NoteCommentTypes.QUESTION && deletedCounts > 0) {
          await txEntityManager.decrement(
            NoteCommentEntity,
            { commentId: comment.fatherId },
            'aCounts',
            deletedCounts,
          );
        }
      });
      await this.nstatService.updateStat(noteId, NoteStatFields.COMMENTS, -deletedCounts);
      return deletedCounts;
    } catch (err) {
      throw err;
    } finally {
      await this.redisService.unlock(key);
    }
  }

  /**
   * 新建评论点赞
   */
  async createLike(cDto: NoteCommentLikeDTO): Promise<any> {
    let entity;
    const { commentId, userId } = cDto;
    const key = UtilsService.format(
      RedisNames.NOTE_COMMENT_LIKE_LOCKED,
      userId,
      commentId,
    );

    const comment = await this.findOneNotException({ commentId }, [
      'type',
      'noteId',
      'userId',
    ]);
    if (!comment) {
      return true;
    }

    const psave = await this.connection
      .getRepository(PointNoteEntity)
      .findOne({ noteId: comment.noteId }, { select: ['psaveId'] });

    //创建点赞
    const like = new CommentLikeEntity();
    like.commentId = commentId;
    like.userId = userId;
    try {
      if (!(await this.redisService.lock(key))) {
        return 0;
      }

      await this.connection.getRepository(CommentLikeEntity).save(like);
      //更新评论点赞次数
      await this.incrLikes(commentId);

      const message: ILikeMessage = {
        userId,
        type: MessageReturnTypes.LIKE_COMMENT,
        noteId: comment.noteId,
        psaveId: psave.psaveId,
        commentId,
      };
      await this.msgService.message(comment.userId, message, MessageQueryTypes.LIKE);

      return entity;
    } catch (err) {
      const dupEntry = 'ER_DUP_ENTRY';
      Logger.error(err.message, NoteStatService.name);
      if (err.message.search(dupEntry) === 0) {
        throw new ForbiddenException(ERRORS.NOTE_LIKE_DUP);
      }
      throw err;
    } finally {
      await this.redisService.unlock(key);
    }
  }

  /**
   * 取消点赞
   */
  async deleteLike(dDto: NoteCommentLikeDTO): Promise<any> {
    const { commentId, userId } = dDto;
    const key = UtilsService.format(
      RedisNames.NOTE_COMMENT_LIKE_LOCKED,
      userId,
      commentId,
    );
    try {
      if (!(await this.redisService.lock(key))) {
        return 0;
      }
      const result = await this.connection
        .getRepository(CommentLikeEntity)
        .delete({ commentId });
      if (result.affected > 0) {
        await this.decrLikes(commentId);
      }
      return true;
    } catch (err) {
      throw err;
    } finally {
      await this.redisService.unlock(key);
    }
  }

  /**
   * 获取评论
   */
  async getAll(gDto: NoteCommentGetAllDTO): Promise<any> {
    const nstat = await this.nstatService.getOne({ noteId: gDto.noteId });
    const commentAlias = 'comment',
      userAlias = 'user',
      likeAlias = 'like';
    const where = `${commentAlias}.noteId = ${gDto.noteId} and ${commentAlias}.type = '${NoteCommentTypes.QUESTION}'`;

    let queryFields = [
      `${commentAlias}.userId`,
      `${commentAlias}.commentId`,
      `${commentAlias}.createdAt`,
      `${commentAlias}.comment`,
      `${commentAlias}.type`,
      `${commentAlias}.likes`,
      `${commentAlias}.aCounts`,
      `${likeAlias}.nlId`,
      `${userAlias}.nickName`,
      `${userAlias}.avatarUrl`,
    ];
    let comments: any[],
      commentCounts = 0;
    [comments, commentCounts] = await this.connection
      .createQueryBuilder(NoteCommentEntity, commentAlias)
      .innerJoinAndMapOne(
        `${commentAlias}.user`,
        UserEntity,
        userAlias,
        `${userAlias}.userId = ${commentAlias}.userId`,
      )
      .leftJoinAndMapOne(
        `${commentAlias}.like`,
        CommentLikeEntity,
        likeAlias,
        `${likeAlias}.userId = ${gDto.userId} and ${likeAlias}.commentId = ${commentAlias}.commentId`,
      )
      .where(where)
      .select(queryFields)
      .skip(gDto.start)
      .take(gDto.take)
      .orderBy(`${commentAlias}.likes`, gDto.order)
      .addOrderBy(`${commentAlias}.createdAt`, gDto.order)
      .getManyAndCount();

    const page = new PageResponseInternalDTO(gDto.start, comments.length, commentCounts);
    if (comments.length === 0) {
      return {
        comments: [],
        page,
      };
    }

    const commentKeys = [];
    comments.forEach(comment => {
      comment.isLiked = comment.like ? true : false;
      Object.assign(comment, comment.user);
      Object.assign(comment, comment.like);
      delete comment.user;
      delete comment.like;
      commentKeys.push(UtilsService.format(RedisNames.COMMENT_STATS, comment.commentId));
    });

    const cacheLikes = await this.redisService.hmgetall(commentKeys);
    comments.forEach((comment, index) => {
      const like: any = UtilsService.arrayToObject(cacheLikes[index]);
      if (like) {
        comment.likes = Number(like.likes);
      }
    });

    queryFields = [
      `${commentAlias}.userId`,
      `${commentAlias}.commentId`,
      `${commentAlias}.createdAt`,
      `${commentAlias}.comment`,
      `${commentAlias}.type`,
      `${commentAlias}.aCounts`,
      `${commentAlias}.likes`,
      `${likeAlias}.nlId`,
      `${userAlias}.nickName`,
      `${userAlias}.avatarUrl`,
    ];

    for (let i = 0; i < comments.length; i++) {
      if (comments[i].aCounts > 0) {
        const where = `${commentAlias}.fatherId = ${comments[i].commentId} and ${commentAlias}.type = '${NoteCommentTypes.ANSWER}'`;
        const subComment: any = await this.connection
          .createQueryBuilder(NoteCommentEntity, commentAlias)
          .innerJoinAndMapOne(
            `${commentAlias}.user`,
            UserEntity,
            userAlias,
            `${userAlias}.userId = ${commentAlias}.userId`,
          )
          .leftJoinAndMapOne(
            `${commentAlias}.like`,
            CommentLikeEntity,
            likeAlias,
            `${likeAlias}.userId = ${gDto.userId} and ${likeAlias}.commentId = ${commentAlias}.commentId`,
          )
          .where(where)
          .select(queryFields)
          .getOne();

        const key = UtilsService.format(RedisNames.COMMENT_STATS, subComment.commentId);
        const like = await this.redisService.hgetall(key);
        if (like && like.likes) {
          subComment.likes = Number(like.likes);
        }
        if (subComment) {
          const {
            userId,
            commentId,
            createdAt,
            comment,
            type,
            user,
            aCounts,
            like,
            likes,
          } = subComment;
          comments[i].aUserId = userId;
          comments[i].aCommentId = commentId;
          comments[i].aCreatedAt = createdAt;
          comments[i].aComment = comment;
          comments[i].aType = type;
          comments[i].aNickName = user.nickName;
          comments[i].aAvatarUrl = user.avatarUrl;
          comments[i].aACounts = aCounts;
          comments[i].aLikes = likes;
          comments[i].aIsLiked = like ? true : false;
        }
      }
    }

    return {
      counts: nstat.comments,
      comments,
      page,
    };
  }

  /**
   * 获取子评论
   */
  async getSubAll(gDto: NoteCommentGetSubAllDTO): Promise<any> {
    const commentAlias = 'comment',
      userAlias = 'user',
      likeAlias = 'like';
    const where = `${commentAlias}.fatherId = ${gDto.commentId}`;
    let queryFields = [
      `${commentAlias}.userId`,
      `${commentAlias}.upId`,
      `${commentAlias}.commentId`,
      `${commentAlias}.createdAt`,
      `${commentAlias}.comment`,
      `${commentAlias}.type`,
      `${commentAlias}.likes`,
      `${likeAlias}.nlId`,
      `${userAlias}.nickName`,
      `${userAlias}.avatarUrl`,
    ];

    let comments: any[] = await this.connection
      .createQueryBuilder(NoteCommentEntity, commentAlias)
      .innerJoinAndMapOne(
        `${commentAlias}.user`,
        UserEntity,
        userAlias,
        `${userAlias}.userId = ${commentAlias}.userId`,
      )
      .leftJoinAndMapOne(
        `${commentAlias}.like`,
        CommentLikeEntity,
        likeAlias,
        `${likeAlias}.userId = ${gDto.userId} and ${likeAlias}.commentId = ${commentAlias}.commentId`,
      )
      .where(where)
      .select(queryFields)
      .skip(gDto.start)
      .take(gDto.take)
      .orderBy(`${commentAlias}.createdAt`, SqlOrderTypes.ASC)
      .getMany();

    const page = new PageResponseInternalDTO(
      gDto.start,
      comments.length,
      Number(gDto.counts),
    );
    if (comments.length === 0) {
      return {
        comments: [],
        page,
      };
    }

    const upIds = [],
      indexes = [];

    for (let i = 0; i < comments.length; i++) {
      if (comments[i].upId > 0) {
        upIds.push(comments[i].upId);
        indexes.push(i);
      }
      const key = UtilsService.format(RedisNames.COMMENT_STATS, comments[i].commentId);
      const like = await this.redisService.hgetall(key);
      if (like && like.likes) {
        comments[i].likes = Number(like.likes);
      }

      comments[i].fromNickName = comments[i].user.nickName;
      comments[i].fromAvatarUrl = comments[i].user.avatarUrl;
      comments[i].fromUserId = comments[i].userId;
      comments[i].isLiked = comments[i].like ? true : false;
      delete comments[i].user;
    }

    queryFields = [
      `${commentAlias}.userId`,
      `${commentAlias}.type`,
      `${userAlias}.nickName`,
    ];
    if (upIds.length > 0) {
      const subComments: any[] = await this.connection
        .createQueryBuilder(NoteCommentEntity, commentAlias)
        .innerJoinAndMapOne(
          `${commentAlias}.user`,
          UserEntity,
          userAlias,
          `${userAlias}.userId = ${commentAlias}.userId`,
        )
        .select(queryFields)
        .whereInIds(upIds)
        .orderBy(UtilsService.orderString(`${commentAlias}.commentId`, upIds))
        .getMany();

      subComments.forEach((comment, index) => {
        comments[indexes[index]].toNickName = comment.user.nickName;
        comments[indexes[index]].toUserId = comment.userId;
      });
    }

    return {
      comments,
      page,
    };
  }
}
