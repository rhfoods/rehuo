import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { PUBLIC_MAP_USER_ID } from '@rehuo/common/constants/map.constant';
import { RedisNames, RedisTimeouts } from '@rehuo/common/constants/redis.constant';
import { RehuoOffical } from '@rehuo/common/constants/rehuo.constant';
import { DBService } from '@rehuo/common/db/db.service';
import { UtilsService } from '@rehuo/common/providers/utils.service';
import { HintService } from '@rehuo/hint/hint.service';
import { HintUserEntity } from '@rehuo/models/hint.user.entity';
import { UserEntity } from '@rehuo/models/user.entity';
import { UserStatEntity } from '@rehuo/models/user.stat.entity';
import { RedisService } from '@rehuo/redis/redis.service';
import { Connection, DeepPartial, FindConditions, Repository } from 'typeorm';
import { UserStatService } from './user.stat.service';

const userFields: any[] = [
  'userId',
  'nickName',
  'avatarUrl',
  'introduce',
  'gender',
  'city',
  'wxOpenId',
  'isNotified'
];

@Injectable()
export class UserService extends DBService<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
    @InjectRepository(UserStatEntity)
    private ustatRepo: Repository<UserStatEntity>,
    @Inject(forwardRef(() => HintService))
    private readonly hintService: HintService,
    @Inject(forwardRef(() => UserStatService))
    private readonly ustatService: UserStatService,
    @Inject(forwardRef(() => RedisService))
    private readonly redisService: RedisService,
    @InjectConnection()
    private readonly connection: Connection,
  ) {
    super(userRepo, UserService.name);
  }

  private async cache(userId: number, data: object, fields?: string[]): Promise<boolean> {
    const key = UtilsService.format(RedisNames.USER_INFO, userId);
    const obj = fields ? UtilsService.extractSome(data, fields) : data;
    return this.redisService.save(key, JSON.stringify(obj), RedisTimeouts.USER_INFO);
  }

  private async uncache(userId: number) {
    const key = UtilsService.format(RedisNames.USER_INFO, userId);
    await this.redisService.unsave(key);
  }

  private async getByCache(userId: number): Promise<any> {
    const key = UtilsService.format(RedisNames.USER_INFO, userId);
    const user = await this.redisService.get(key);
    if (user) {
      return JSON.parse(user);
    }
    return user;
  }

  /**
   * 新建用户
   */
  async createOne(user: UserEntity): Promise<any> {
    let entity: UserEntity = await this.findOneNotException(
      { wxOpenId: user.wxOpenId },
      userFields,
    );
    const isExist = entity ? true : false;

    if (!entity) {
      const key = UtilsService.format(RedisNames.USER_CREATE_LOCKED, user.wxOpenId);
      try {
        if (!(await this.redisService.lock(key))) {
          return { isExist, entity: {} };
        }

        await this.connection.transaction('READ COMMITTED', async txEntityManager => {
          entity = await txEntityManager.save(UserEntity, user);
          await txEntityManager.save(UserStatEntity, { userId: entity.userId });
          await txEntityManager.save(HintUserEntity, { userId: entity.userId });
        });
      } catch (err) {
        throw err;
      } finally {
        await this.redisService.unlock(key);
      }
    } else {
      if (Object.keys(user).includes('wxOpenId') && Object.keys(user).length > 1) {
        await this.update({ wxOpenId: user.wxOpenId }, user);
        entity = await this.findOneNotException({ wxOpenId: user.wxOpenId }, userFields);
      }
    }

    return { isExist, entity };
  }

  /**
   * 更新用户信息
   */
  async updateOne(
    findData: FindConditions<UserEntity>,
    user: DeepPartial<UserEntity>,
  ): Promise<any> {
    const result = await this.update(findData, user);
    if (result) {
      await this.uncache(Number(findData.userId));
    }
    return result;
  }

  /**
   * 获取用户基本信息
   */
  async getOne(
    findData: FindConditions<UserEntity>,
    fields: any[] = userFields,
  ): Promise<any> {
    if (Number(findData.userId) === PUBLIC_MAP_USER_ID) {
      return RehuoOffical;
    }

    let user = await this.getByCache(Number(findData.userId));
    if (!user) {
      user = await this.findOne(findData, fields);
      await this.cache(Number(findData.userId), user);
    }

    return user;
  }

  /**
   * 获取用户信息
   */
  async getMore(findData: FindConditions<UserEntity>): Promise<any> {
    const fields = [
      ...userFields,
      'saveMaps',
      'savePoints',
      'createPoints',
      'defaultCss',
    ];
    const user: any = await this.findOne(findData, fields);
    const ustat: UserStatEntity = await this.ustatService.getOne(findData);

    delete ustat.usId;
    delete ustat.userId;
    Object.assign(user, ustat);

    const { savetops, clocks, likes, systems, comments } = await this.hintService.getOne(
      Number(findData.userId),
    );
    user.hints = savetops + clocks + likes + systems + comments;

    return user;
  }

  /**
   * 查找所有匹配的对象
   */
  async getByIds(ids: number[], fields: any[] = userFields): Promise<any> {
    return this.findByIds(ids, fields);
  }
}
