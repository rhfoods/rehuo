import { BadRequestException } from '@nestjs/common';
import { ERRORS } from '@rehuo/common/constants/error.constant';
import { CityPointEntity } from '@rehuo/models/city.point.entity';
import { CountryPointEntity } from '@rehuo/models/country.point.entity';
import { PointSortEntity } from '@rehuo/models/point.sort.entity';
import { ProvincePointEntity } from '@rehuo/models/province.point.entity';
import { UserEntity } from '@rehuo/models/user.entity';
import { EntityManager, MoreThan } from 'typeorm';
/**
 * 点位和点位收藏聚合处理
 */
export class PointUtilsService {
  /**
   * 根据sortId的改变更新对应数据
   */
  static async updateBySortIdChanged(
    entityManager: EntityManager,
    userId: number,
    sortId: number,
    oldSortId: number,
  ) {
    //如果分类没有改变则直接返回
    if (sortId === oldSortId) {
      return;
    }

    if (sortId > 0) {
      //查找准备更改的分类是否存在
      if (
        !(await entityManager.findOne(
          PointSortEntity,
          { sortId, userId },
          { select: ['sortId'] },
        ))
      ) {
        throw new BadRequestException(ERRORS.PARAMS_INVALID);
      }
      await entityManager.increment(PointSortEntity, { sortId }, 'points', 1);
      if (oldSortId !== 0) {
        await entityManager.decrement(
          PointSortEntity,
          { sortId: oldSortId },
          'points',
          1,
        );
      } else {
        await entityManager.decrement(UserEntity, { userId }, 'defaultCss', 1);
      }
    } else {
      await entityManager.increment(UserEntity, { userId }, 'defaultCss', 1);
      await entityManager.decrement(PointSortEntity, { sortId: oldSortId }, 'points', 1);
    }
  }

  static formatAdcode(adcode: string) {
    const pCode = adcode.slice(0, 2);
    /**
     * 对不属于任何二三线城市的区县进行特殊处理
     */
    let cCode = adcode.slice(2, 4) !== '90' ? adcode.slice(0, 4) : adcode;
    let fCode = cCode;
    /**
     * 对重庆地区的特殊处理
     */
    if (pCode === '50') {
      cCode = '5000';
      fCode = '500';
    }

    return { pCode, cCode, fCode };
  }

  /**
   * 根据点位的code编码增加该用户在各省市的点位存储数量
   */
  static async incrementPCP(
    entityManager: EntityManager,
    userId: number,
    adcode: string,
  ) {
    const { pCode, cCode } = PointUtilsService.formatAdcode(adcode);

    const pPoint = await entityManager.findOne(ProvincePointEntity, {
      where: { userId, code: pCode },
      select: ['ppId'],
    });
    const cPoint = await entityManager.findOne(CityPointEntity, {
      where: { userId, code: cCode },
      select: ['cpId'],
    });
    const adPoint = await entityManager.findOne(CountryPointEntity, {
      where: { userId, code: adcode },
      select: ['cpId'],
    });
    if (pPoint) {
      await entityManager.increment(
        ProvincePointEntity,
        { ppId: pPoint.ppId },
        'counts',
        1,
      );
    } else {
      const point = new ProvincePointEntity();
      point.userId = userId;
      point.code = pCode;
      point.counts = 1;
      await entityManager.save(point);
    }

    if (cPoint) {
      await entityManager.increment(CityPointEntity, { cpId: cPoint.cpId }, 'counts', 1);
    } else {
      const point = new CityPointEntity();
      point.userId = userId;
      point.code = cCode;
      point.counts = 1;
      await entityManager.save(point);
    }

    if (adPoint) {
      await entityManager.increment(
        CountryPointEntity,
        { cpId: adPoint.cpId },
        'counts',
        1,
      );
    } else {
      const point = new CountryPointEntity();
      point.userId = userId;
      point.code = adcode;
      point.counts = 1;
      await entityManager.save(point);
    }
  }

  /**
   * 根据点位的code编码减少该用户在各省市的点位存储数量
   */
  static async decrementPCP(
    entityManager: EntityManager,
    userId: number,
    adcode: string,
  ) {
    const { pCode, cCode } = PointUtilsService.formatAdcode(adcode);

    const pPoint = await entityManager.findOne(ProvincePointEntity, {
      where: { userId, code: pCode },
      select: ['ppId'],
    });
    const cPoint = await entityManager.findOne(CityPointEntity, {
      where: { userId, code: cCode },
      select: ['cpId'],
    });
    const adPoint = await entityManager.findOne(CountryPointEntity, {
      where: { userId, code: adcode },
      select: ['cpId'],
    });

    if (pPoint) {
      await entityManager.decrement(
        ProvincePointEntity,
        { ppId: pPoint.ppId },
        'counts',
        1,
      );
    }
    if (cPoint) {
      await entityManager.decrement(CityPointEntity, { cpId: cPoint.cpId }, 'counts', 1);
    }
    if (adPoint) {
      await entityManager.decrement(
        CountryPointEntity,
        { cpId: adPoint.cpId },
        'counts',
        1,
      );
    }
  }

  /**
   * 进行点位迁移对应的数据更新
   */
  static async transferPCP(
    entityManager: EntityManager,
    fromUserId: number,
    toUserId: number,
  ) {
    const pPoints = await entityManager.find(ProvincePointEntity, {
      where: { userId: fromUserId, counts: MoreThan(0) },
      select: ['code', 'counts'],
    });
    const cPoints = await entityManager.find(CityPointEntity, {
      where: { userId: fromUserId, counts: MoreThan(0) },
      select: ['code', 'counts'],
    });
    const adPoints = await entityManager.find(CountryPointEntity, {
      where: { userId: fromUserId, counts: MoreThan(0) },
      select: ['code', 'counts'],
    });

    for (let i = 0; i < pPoints.length; i++) {
      const point = await entityManager.findOne(ProvincePointEntity, {
        where: { userId: toUserId, code: pPoints[i].code },
        select: ['ppId'],
      });
      if (point) {
        await entityManager.increment(
          ProvincePointEntity,
          { ppId: point.ppId },
          'counts',
          pPoints[i].counts,
        );
      } else {
        await entityManager.save(ProvincePointEntity, {
          userId: toUserId,
          code: pPoints[i].code,
          counts: pPoints[i].counts,
        });
      }
    }
    for (let i = 0; i < cPoints.length; i++) {
      const point = await entityManager.findOne(CityPointEntity, {
        where: { userId: toUserId, code: cPoints[i].code },
        select: ['cpId'],
      });
      if (point) {
        await entityManager.increment(
          CityPointEntity,
          { cpId: point.cpId },
          'counts',
          cPoints[i].counts,
        );
      } else {
        await entityManager.save(CityPointEntity, {
          userId: toUserId,
          code: cPoints[i].code,
          counts: cPoints[i].counts,
        });
      }
    }

    for (let i = 0; i < adPoints.length; i++) {
      const point = await entityManager.findOne(CountryPointEntity, {
        where: { userId: toUserId, code: adPoints[i].code },
        select: ['cpId'],
      });

      if (point) {
        await entityManager.increment(
          CountryPointEntity,
          { cpId: point.cpId },
          'counts',
          adPoints[i].counts,
        );
      } else {
        await entityManager.save(CountryPointEntity, {
          userId: toUserId,
          code: adPoints[i].code,
          counts: adPoints[i].counts,
        });
      }
    }

    await entityManager.delete(ProvincePointEntity, { userId: fromUserId });
    await entityManager.delete(CityPointEntity, { userId: fromUserId });
    await entityManager.delete(CountryPointEntity, { userId: fromUserId });
  }
}
