import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigNamespaces } from '@rehuo/common/constants/config.constant';
import { RedisTimeouts } from '@rehuo/common/constants/redis.constant';
import { UtilsService } from '@rehuo/common/providers/utils.service';
import Redis = require('ioredis');

@Injectable()
export class RedisService implements OnModuleInit {
  private readonly client: Redis.Redis;
  private readonly untilReady: Promise<void>;

  constructor(private readonly configService: ConfigService) {
    const { host, port, password } = configService.get(ConfigNamespaces.REDIS);
    this.client = new Redis(port, host, {
      enableReadyCheck: true,
      password,
    });

    // TODO: Handle errors after connected?
    this.untilReady = new Promise((resolve, reject) => {
      this.client.once('ready', resolve);
      this.client.once('error', reject);
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.untilReady;
    } catch (e) {
      throw new Error(`Could not connect to Redis service: ${e}`);
    }
  }

  public getClient(): Redis.Redis {
    return this.client.duplicate();
  }

  /**
   * 对POST请求进行加锁
   */
  async lock(key: string, expired?: number): Promise<boolean> {
    if (await this.client.get(key)) {
      return false;
    } else {
      await this.client.set(
        key,
        '1',
        'EX',
        expired || RedisTimeouts.DEFAULT_TIMEOUT,
        'NX',
      );

      return true;
    }
  }

  /**
   * 删除POST请求锁
   */
  async unlock(key: string) {
    await this.client.del(key);
  }

  /**
   * 缓存数据
   */
  async save(
    key: string,
    data: string,
    expired: number = RedisTimeouts.DEFAULT_TIMEOUT,
  ): Promise<any> {
    const result = await this.client.set(key, data, 'EX', expired);
    if (result === 'OK') {
      return true;
    } else {
      return false;
    }
  }

  /**
   * 删除缓存数据
   */
  async unsave(key: string): Promise<any> {
    return this.client.del(key);
  }

  /**
   * 获取缓存数据
   */
  async get(key: string): Promise<any> {
    return this.client.get(key);
  }

  /**
   * 获取缓存对象中单个数据
   */
  async exists(key: string): Promise<any> {
    return this.client.exists(key);
  }

  /**
   * 缓存对象数据
   */
  async hmset(key: string, obj: Record<string, any>, expires?: number): Promise<any> {
    const datas = UtilsService.objectToArray(obj);

    if (expires) {
      await this.client.hmset(key, datas);
      return this.client.expire(key, expires);
    } else {
      return this.client.hmset(key, datas);
    }
  }

  /**
   * 获取缓存对象中单个数据
   */
  async hget(key: string, field: string): Promise<any> {
    return this.client.hget(key, field);
  }

  /**
   * 获取对象所有数据
   */
  async hgetall(key: string): Promise<any> {
    return this.client.hgetall(key);
  }

  /**
   * 获取对象中多个数据
   */
  async hmget(key: string, ...fields): Promise<any> {
    return this.client.hmget(key, ...fields);
  }

  /**
   * 批量获取多个数据
   */
  async mget(keys: string[]): Promise<any> {
    return this.client.mget(...keys);
  }

  /**
   * 批量获取多个数据
   */
  async hmgetall(keys: string[]): Promise<any> {
    const luaScript =
      "local rst={}; for i,v in pairs(KEYS) do rst[i]=redis.call('hgetall', v) end; return rst";
    return this.client.eval(luaScript, keys.length, ...keys);
  }

  /**
   * 增加对象中的某项
   */
  async hincrby(key: string, field: string, value: number): Promise<any> {
    return this.client.hincrby(key, field, value);
  }

  /**
   * 增加集合中数据
   */
  async sadd(key: string, member: any): Promise<any> {
    return this.client.sadd(key, member);
  }

  /**
   * 返回集合的元素数量
   */
  async scard(key: string): Promise<any> {
    return this.client.scard(key);
  }

  /**
   * 删除集合中指定的元素
   */
  async srem(key: string, field: string): Promise<any> {
    return this.srem(key, field);
  }

  /**
   * 获取集合中所有成员
   */
  async smembers(key: string): Promise<any> {
    return this.smembers(key);
  }

  /**
   * 返回集合中指定的元素并在集合中删除
   */
  async spop(key: string, count: number): Promise<any> {
    return this.client.spop(key, count);
  }
}
