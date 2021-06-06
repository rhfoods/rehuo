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
import {
  NoteStatFields,
  RedisNames,
  RedisTimeouts,
  UserStatFields,
} from '@rehuo/common/constants/redis.constant';
import { DBService } from '@rehuo/common/db/db.service';
import { ILikeMessage } from '@rehuo/common/interfaces/message.interface';
import { UtilsService } from '@rehuo/common/providers/utils.service';
import { MessageService } from '@rehuo/message/message.service';
import { NoteLikeEntity } from '@rehuo/models/note.like.entity';
import { NoteStatEntity } from '@rehuo/models/note.stat.entity';
import { RedisService } from '@rehuo/redis/redis.service';
import { UserStatService } from '@rehuo/user/services/user.stat.service';
import { Connection, FindConditions, Repository } from 'typeorm';
import { PointNoteLikeDTO } from '../dtos/point.note.crud.dto';
import { PointNoteService } from './point.note.service';

const nsFields = Object.values(NoteStatFields);

@Injectable()
export class NoteStatService extends DBService<NoteStatEntity> {
  constructor(
    @InjectRepository(NoteStatEntity)
    private nstatRepo: Repository<NoteStatEntity>,
    @Inject(forwardRef(() => RedisService))
    private readonly redisService: RedisService,
    @Inject(forwardRef(() => UserStatService))
    private readonly ustatService: UserStatService,
    @InjectConnection()
    private readonly connection: Connection,
    private readonly pnoteService: PointNoteService,
    @Inject(forwardRef(() => MessageService))
    private readonly msgService: MessageService,
  ) {
    super(nstatRepo, NoteStatService.name);
  }

  private async cache(noteId: number, nstat: NoteStatEntity): Promise<boolean> {
    const key = UtilsService.format(RedisNames.NOTE_STATS, noteId);

    return this.redisService.hmset(key, nstat, RedisTimeouts.SOMECACHE_STATS);
  }

  private async getByCache(noteId: number): Promise<any> {
    const key = UtilsService.format(RedisNames.NOTE_STATS, noteId);
    return this.redisService.hgetall(key);
  }

  private async incrLikes(noteId: number, userId: number): Promise<any> {
    await this.updateStat(noteId, NoteStatFields.LIKES, 1);
    await this.ustatService.updateStat(userId, UserStatFields.NOTE_LIKES, 1);
  }

  private async decrLikes(noteId: number, userId: number): Promise<any> {
    await this.updateStat(noteId, NoteStatFields.LIKES, -1);
    await this.ustatService.updateStat(userId, UserStatFields.NOTE_LIKES, -1);
  }

  async incrComments(noteId: number): Promise<any> {
    await this.updateStat(noteId, NoteStatFields.COMMENTS, 1);
  }

  async decrComments(noteId: number): Promise<any> {
    await this.updateStat(noteId, NoteStatFields.COMMENTS, -1);
  }

  /**
   * 更新文章统计信息缓存数据
   */
  async updateStat(noteId: number, field: NoteStatFields, value: number): Promise<any> {
    const key = UtilsService.format(RedisNames.NOTE_STATS, noteId);
    const isExist = await this.redisService.exists(key);
    if (!isExist) {
      const nstat = await this.getOne({ noteId });
      await this.redisService.hmset(key, nstat, RedisTimeouts.SOMECACHE_STATS);
      await this.redisService.sadd(RedisNames.NOTE_STAT_CHANGED, key);
    } else {
      await this.redisService.sadd(RedisNames.NOTE_STAT_CHANGED, key);
    }
    await this.redisService.hincrby(key, field, value);
  }

  /**
   * 获取文章状态信息
   */
  async getOne(
    findData: FindConditions<NoteStatEntity>,
    fields: any[] = nsFields,
  ): Promise<any> {
    let nstat = await this.getByCache(Number(findData.noteId));
    if (UtilsService.emptyObject(nstat)) {
      nstat = await this.nstatRepo.findOne(findData, { select: fields });
      await this.cache(Number(findData.noteId), nstat);
    }
    return UtilsService.toNumber(nstat);
  }

  /**
   * 新建文章点赞
   */
  async createLike(cDto: PointNoteLikeDTO): Promise<any> {
    let entity;
    const { noteId, userId } = cDto;
    const key = UtilsService.format(RedisNames.NOTE_LIKE_LOCKED, userId, noteId);

    const note = await this.pnoteService.findOne({ noteId }, ['userId', 'psaveId']);
    //创建点赞
    const notelike = new NoteLikeEntity();
    notelike.noteId = noteId;
    notelike.userId = userId;
    try {
      if (!(await this.redisService.lock(key))) {
        return;
      }
      await this.connection.getRepository(NoteLikeEntity).save(notelike);
      //更新文章点赞次数
      await this.incrLikes(noteId, note.userId);

      const message: ILikeMessage = {
        userId,
        psaveId: note.psaveId,
        type: MessageReturnTypes.LIKE_NOTE,
        noteId,
      };
      await this.msgService.message(note.userId, message, MessageQueryTypes.LIKE);

      return entity;
    } catch (err) {
      const dupEntry = 'ER_DUP_ENTRY';
      await this.decrLikes(noteId, note.userId);
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
  async deleteLike(dDto: PointNoteLikeDTO): Promise<any> {
    const { noteId, userId } = dDto;
    const note = await this.pnoteService.findOne({ noteId }, ['userId']);

    const result = await this.connection.getRepository(NoteLikeEntity).delete({ noteId });
    if (result.affected > 0) {
      await this.decrLikes(noteId, note.userId);
    }
    return true;
  }

  /**
   * 获取是否点赞信息
   */
  async getLike(userId: number, noteId: number): Promise<any> {
    const like = await this.connection
      .getRepository(NoteLikeEntity)
      .findOne({ userId, noteId }, { select: ['nlId'] });
    if (like) {
      return true;
    } else {
      return false;
    }
  }
}
