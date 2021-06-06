import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PUBLIC_MAP_USER_ID } from '@rehuo/common/constants/map.constant';
import {
  HintUserFields,
  RedisNames,
  RedisTimeouts,
} from '@rehuo/common/constants/redis.constant';
import { DBService } from '@rehuo/common/db/db.service';
import { UtilsService } from '@rehuo/common/providers/utils.service';
import { HintUserEntity } from '@rehuo/models/hint.user.entity';
import { RedisService } from '@rehuo/redis/redis.service';
import { Repository } from 'typeorm';

const huFields: any[] = ['userId', 'savetops', 'likes', 'clocks', 'comments', 'systems'];

@Injectable()
export class HintService extends DBService<HintUserEntity> {
  private redis;
  constructor(
    @InjectRepository(HintUserEntity)
    private huRepo: Repository<HintUserEntity>,
    private readonly redisService: RedisService,
  ) {
    super(huRepo, HintService.name);
    this.redis = redisService.getClient();
  }

  private async cache(userId: number, data: object, fields?: string[]): Promise<boolean> {
    const key = UtilsService.format(RedisNames.HINT_USER, userId);
    const obj = fields ? UtilsService.extractSome(data, fields) : data;
    return this.redisService.hmset(key, obj, RedisTimeouts.HINT_USER);
  }

  private async uncache(userId: number) {
    const key = UtilsService.format(RedisNames.HINT_USER, userId);
    await this.redisService.unsave(key);
  }

  private async getByCache(userId: number): Promise<any> {
    const key = UtilsService.format(RedisNames.HINT_USER, userId);
    return this.redisService.hgetall(key);
  }

  /**
   * 初始化hint表
   */
  async new(userId: number): Promise<any> {
    await this.create({
      userId,
    });
  }

  /**
   * 获取HINT信息
   */
  async getOne(userId: number): Promise<any> {
    if (userId === PUBLIC_MAP_USER_ID) {
      return {
        userId: PUBLIC_MAP_USER_ID,
        savetops: 0,
        likes: 0,
        clocks: 0,
        comments: 0,
        systems: 0,
      };
    }
    let hint = await this.getByCache(userId);
    if (UtilsService.emptyObject(hint)) {
      hint = await this.findOneNotException({ userId }, huFields);
      if (hint) {
        await this.cache(userId, hint);
      } else {
        Logger.error(
          `sorry, An error occurred about user hint info of userId:${userId} ......`,
        );
        throw new Error();
      }
    }
    return hint;
  }

  /**
   * 更新用户提示信息
   */
  async updateHints(userId: number, field: HintUserFields): Promise<any> {
    const key = UtilsService.format(RedisNames.HINT_USER, userId);
    const isExist = await this.redisService.exists(key);
    if (!isExist) {
      await this.getOne(userId);
    }

    await this.redis.hincrby(key, field, 1);
    await this.redis.sadd(RedisNames.HINT_CHANGED, key);
  }
}
