import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { RedisNames, REDIS_ONE_TAKE_COUNT } from '@rehuo/common/constants/redis.constant';
import { DBService } from '@rehuo/common/db/db.service';
import { UtilsService } from '@rehuo/common/providers/utils.service';
import { HintUserEntity } from '@rehuo/models/hint.user.entity';
import { NoteCommentEntity } from '@rehuo/models/note.comment.entity';
import { NoteStatEntity } from '@rehuo/models/note.stat.entity';
import { UserStatEntity } from '@rehuo/models/user.stat.entity';
import { RedisService } from '@rehuo/redis/redis.service';
import { Redis } from 'ioredis';
import { Connection, Repository } from 'typeorm';

@Injectable()
export class DataSyncService extends DBService<HintUserEntity> {
  private redis: Redis;
  constructor(
    @InjectRepository(HintUserEntity)
    private huRepo: Repository<HintUserEntity>,
    private readonly redisService: RedisService,
    @InjectConnection()
    private readonly connection: Connection,
  ) {
    super(huRepo, DataSyncService.name);
    this.redis = this.redisService.getClient();
  }

  /**
   * 同步用户提示信息到数据库
   */
  private async syncHintUserToDB(hintKey: string): Promise<any> {
    const userId = Number(hintKey.split(':')[2]);
    const hint = await this.redis.hgetall(hintKey);
    if (hint) {
      delete hint.userId;
      const hintUser = await this.findOne({ userId }, [
        'savetops',
        'clocks',
        'comments',
        'systems',
        'likes',
      ]);
      Object.keys(hint).forEach(key => {
        hintUser[key] += Number(hint[key]);
      });
      await this.update({ userId }, hintUser);
    }
    await this.redis.del(hintKey);
  }

  /**
   * 文章数据到数据库
   */
  private async syncNoteStatToDB(key: string): Promise<any> {
    const splits = key.split(':');
    const noteId = Number(splits[2]);
    const nstat = await this.redis.hgetall(key);
    await this.redis.del(key);

    if (!UtilsService.emptyObject(nstat)) {
      await this.connection.getRepository(NoteStatEntity).update({ noteId }, nstat);
    }
  }

  /**
   * 用户数据到数据库
   */
  private async syncUserStatToDB(key: string): Promise<any> {
    const splits = key.split(':');
    const userId = Number(splits[2]);
    const ustat = await this.redis.hgetall(key);
    await this.redis.del(key);

    if (!UtilsService.emptyObject(ustat)) {
      await this.connection.getRepository(UserStatEntity).update({ userId }, ustat);
    }
  }

  /**
   * 评论数据到数据库
   */
  private async syncCommentStatToDB(key: string): Promise<any> {
    const splits = key.split(':');
    const commentId = Number(splits[2]);
    const cstat = await this.redis.hgetall(key);
    await this.redis.del(key);

    if (!UtilsService.emptyObject(cstat)) {
      if (Number(cstat.likes) > 0) {
        await this.connection
          .getRepository(NoteCommentEntity)
          .increment({ commentId }, 'likes', Number(cstat.likes));
      } else {
        await this.connection
          .getRepository(NoteCommentEntity)
          .decrement({ commentId }, 'likes', Math.abs(Number(cstat.likes)));
      }
    }
  }

  /**
   * 缓存数据同步到数据库
   */
  async syncRedisToDB(): Promise<any> {
    //同步消息提示数据
    let clen = await this.redis.scard(RedisNames.HINT_CHANGED);
    let sets;
    if (clen > 0) {
      do {
        sets = await this.redis.spop(RedisNames.HINT_CHANGED, REDIS_ONE_TAKE_COUNT);
        sets.forEach(async key => {
          await this.syncHintUserToDB(key);
        });

        clen -= sets.length;
      } while (clen > 0);
    }

    //同步文章浏览数据
    clen = await this.redis.scard(RedisNames.NOTE_STAT_CHANGED);
    if (clen > 0) {
      do {
        sets = await this.redis.spop(RedisNames.NOTE_STAT_CHANGED, REDIS_ONE_TAKE_COUNT);
        sets.forEach(async key => {
          await this.syncNoteStatToDB(key);
        });
        clen -= sets.length;
      } while (clen > 0);
    }

    //同步用户数据
    clen = await this.redis.scard(RedisNames.USER_STAT_CHANGED);
    if (clen > 0) {
      do {
        sets = await this.redis.spop(RedisNames.USER_STAT_CHANGED, REDIS_ONE_TAKE_COUNT);
        sets.forEach(async key => {
          await this.syncUserStatToDB(key);
        });
        clen -= sets.length;
      } while (clen > 0);
    }

    //同步评论数据
    clen = await this.redis.scard(RedisNames.COMMENT_STAT_CHANGED);
    if (clen > 0) {
      do {
        sets = await this.redis.spop(
          RedisNames.COMMENT_STAT_CHANGED,
          REDIS_ONE_TAKE_COUNT,
        );
        sets.forEach(async key => {
          await this.syncCommentStatToDB(key);
        });
        clen -= sets.length;
      } while (clen > 0);
    }
  }

  /**
   * 更新缓存
   */
  async flushdb(): Promise<any> {
    return this.redis.flushall();
  }
}
