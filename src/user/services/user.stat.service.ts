import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PUBLIC_MAP_USER_ID } from '@rehuo/common/constants/map.constant';
import {
  RedisNames,
  RedisTimeouts,
  UserStatFields,
} from '@rehuo/common/constants/redis.constant';
import { DBService } from '@rehuo/common/db/db.service';
import { UtilsService } from '@rehuo/common/providers/utils.service';
import { UserStatEntity } from '@rehuo/models/user.stat.entity';
import { RedisService } from '@rehuo/redis/redis.service';
import { FindConditions, Repository } from 'typeorm';

const usFields = Object.values(UserStatFields);

@Injectable()
export class UserStatService extends DBService<UserStatEntity> {
  constructor(
    @InjectRepository(UserStatEntity)
    private ustatRepo: Repository<UserStatEntity>,
    @Inject(forwardRef(() => RedisService))
    private readonly redisService: RedisService,
  ) {
    super(ustatRepo, UserStatService.name);
  }

  private async cache(userId: number, ustat: UserStatEntity): Promise<boolean> {
    const key = UtilsService.format(RedisNames.USER_STATS, userId);
    return this.redisService.hmset(key, ustat, RedisTimeouts.SOMECACHE_STATS);
  }

  private async getByCache(userId: number): Promise<any> {
    const key = UtilsService.format(RedisNames.USER_STATS, userId);
    return this.redisService.hgetall(key);
  }

  /**
   * 更新用户数据缓存数据
   */
  async updateStat(userId: number, field: string, value: number): Promise<any> {
    if (userId === PUBLIC_MAP_USER_ID) {
      return;
    }
    const key = UtilsService.format(RedisNames.USER_STATS, userId);
    const isExist = await this.redisService.exists(key);
    if (!isExist) {
      const ustat = await this.getOne({ userId });
      await this.redisService.hmset(key, ustat, RedisTimeouts.SOMECACHE_STATS);
      await this.redisService.sadd(RedisNames.USER_STAT_CHANGED, key);
    } else {
      await this.redisService.sadd(RedisNames.USER_STAT_CHANGED, key);
    }
    await this.redisService.hincrby(key, field, value);
  }

  /**
   * 获取用户数据
   */
  async getOne(
    findData: FindConditions<UserStatEntity>,
    fields: any[] = usFields,
  ): Promise<any> {
    let ustat = await this.getByCache(Number(findData.userId));
    if (UtilsService.emptyObject(ustat)) {
      ustat = await this.ustatRepo.findOne(findData, { select: fields });
      await this.cache(Number(findData.userId), ustat);
    }
    return UtilsService.toNumber(ustat);
  }
}
