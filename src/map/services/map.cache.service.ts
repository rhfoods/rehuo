import { Injectable } from '@nestjs/common';
import { RedisNames, RedisTimeouts } from '@rehuo/common/constants/redis.constant';
import { UtilsService } from '@rehuo/common/providers/utils.service';
import { RedisService } from '@rehuo/redis/redis.service';

@Injectable()
export class MapCacheService {
  constructor(private readonly redisService: RedisService) {}

  /**
   * 缓存公共地图城市列表
   */
  async cacheCitys(citys: any): Promise<any> {
    const key = UtilsService.format(RedisNames.PUBLIC_CITYS);
    return this.redisService.save(key, JSON.stringify(citys), RedisTimeouts.PUBLIC_MAP);
  }

  /**
   * 删除缓存中的公共地图城市列表
   */
  async uncacheCitys(): Promise<any> {
    const key = UtilsService.format(RedisNames.PUBLIC_CITYS);
    await this.redisService.unsave(key);
  }

  /**
   * 读取公共地图城市列表
   */
  async getCitys(): Promise<any> {
    const key = UtilsService.format(RedisNames.PUBLIC_CITYS);
    const rawStr = await this.redisService.get(key);
    if (rawStr) {
      return JSON.parse(rawStr);
    }
    return null;
  }

  /**
   * 缓存公共地图中城市的分类信息列表
   */
  async cacheCitySorts(cityCode: string, sorts: any): Promise<any> {
    const key = UtilsService.format(RedisNames.PUBLIC_CITY_SORTS, cityCode);
    return this.redisService.save(key, JSON.stringify(sorts), RedisTimeouts.PUBLIC_MAP);
  }

  /**
   * 删除缓存中的公共地图中城市的分类信息列表
   */
  async uncacheCitySorts(cityCode: string): Promise<any> {
    const key = UtilsService.format(RedisNames.PUBLIC_CITY_SORTS, cityCode);
    await this.redisService.unsave(key);
  }

  /**
   * 读取公共地图中城市的分类信息列表
   */
  async getCitySorts(cityCode: string): Promise<any> {
    const key = UtilsService.format(RedisNames.PUBLIC_CITY_SORTS, cityCode);
    const rawStr = await this.redisService.get(key);
    if (rawStr) {
      return JSON.parse(rawStr);
    }
    return null;
  }

  /**
   * 缓存公共地图中城市分类的点位信息列表
   */
  async cacheCitySortPoints(cityCode: string, sortId: number, points: any): Promise<any> {
    const key = UtilsService.format(RedisNames.PUBLIC_CITY_SORT_POINTS, cityCode, sortId);
    return this.redisService.save(key, JSON.stringify(points), RedisTimeouts.PUBLIC_MAP);
  }

  /**
   * 删除缓存中的公共地图中城市分类的点位信息列表
   */
  async uncacheCitySortPoints(cityCode: string, sortId: number): Promise<any> {
    const key = UtilsService.format(RedisNames.PUBLIC_CITY_SORT_POINTS, cityCode, sortId);
    await this.redisService.unsave(key);
  }

  /**
   * 读取公共地图中城市分类的点位信息列表
   */
  async getCitySortPoints(cityCode: string, sortId: number): Promise<any> {
    const key = UtilsService.format(RedisNames.PUBLIC_CITY_SORT_POINTS, cityCode, sortId);
    const rawStr = await this.redisService.get(key);
    if (rawStr) {
      return JSON.parse(rawStr);
    }
    return null;
  }
}
