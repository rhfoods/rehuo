import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import {
  MessageQueryTypes,
  MessageReturnTypes,
} from '@rehuo/common/constants/message.constant';
import { RedisNames } from '@rehuo/common/constants/redis.constant';
import { UserClockFeels } from '@rehuo/common/constants/user.constant';
import { DBService } from '@rehuo/common/db/db.service';
import { IClockMessage } from '@rehuo/common/interfaces/message.interface';
import { UtilsService } from '@rehuo/common/providers/utils.service';
import { PointSaveService } from '@rehuo/map/modules/point/modules/save/point.save.service';
import { MessageService } from '@rehuo/message/message.service';
import { PointSaveEntity } from '@rehuo/models/point.save.entity';
import { PointSaveStatEntity } from '@rehuo/models/point.save.stat.entity';
import { UserClockEntity } from '@rehuo/models/user.clock.entity';
import { RedisService } from '@rehuo/redis/redis.service';
import { Connection, FindConditions, Repository } from 'typeorm';
import { UserClockDTO } from './dtos/user.clock.crud.dto';

@Injectable()
export class UserClockService extends DBService<UserClockEntity> {
  constructor(
    @InjectRepository(UserClockEntity)
    private ucRepo: Repository<UserClockEntity>,
    @InjectConnection()
    private readonly connection: Connection,
    @Inject(forwardRef(() => PointSaveService))
    private readonly psaveService: PointSaveService,
    @Inject(forwardRef(() => RedisService))
    private readonly redisService: RedisService,
    @Inject(forwardRef(() => MessageService))
    private readonly msgService: MessageService,
  ) {
    super(ucRepo, UserClockService.name);
  }

  /**
   * 打卡
   */
  async createOne(cDto: UserClockDTO): Promise<any> {
    const pointsave = await this.psaveService.getOne({ psaveId: cDto.psaveId }, [
      'pointId',
      'ffpsaveId',
      'userId',
    ]);
    const where = {
      userId: cDto.userId,
      psaveId: cDto.psaveId,
      pointId: pointsave.pointId,
    };
    const uc: UserClockEntity = new UserClockEntity();
    let olduc;
    const key = UtilsService.format(
      RedisNames.USER_CLOCK_LOCKED,
      cDto.userId,
      pointsave.pointId,
    );
    try {
      if (!(await this.redisService.lock(key))) {
        return;
      }
      const field = cDto.feel === UserClockFeels.GOOD ? 'goods' : 'bads';

      await this.connection.transaction('READ COMMITTED', async txEntityManager => {
        olduc = await txEntityManager.findOne(UserClockEntity, {
          where,
          select: ['clockId', 'goods', 'bads'],
        });
        if (olduc) {
          await txEntityManager.increment(
            UserClockEntity,
            { clockId: olduc.clockId },
            'counts',
            1,
          );
          await txEntityManager.increment(
            UserClockEntity,
            { clockId: olduc.clockId },
            field,
            1,
          );
        } else {
          uc.counts = 1;
          uc.pointId = pointsave.pointId;
          cDto.noteId ? (uc.noteId = cDto.noteId) : null;
          uc.psaveId = cDto.psaveId;
          cDto.feel === UserClockFeels.GOOD ? (uc.goods = 1) : (uc.bads = 1);
          uc.userId = cDto.userId;
          olduc = await txEntityManager.save(uc);
          if (cDto.userId === pointsave.userId) {
            await txEntityManager.update(
              PointSaveEntity,
              { psaveId: cDto.psaveId },
              { isPassed: true },
            );
          }
        }
        await txEntityManager.increment(
          PointSaveStatEntity,
          { psaveId: pointsave.ffpsaveId },
          field,
          1,
        );
      });

      const message: IClockMessage | any = {
        userId: cDto.userId,
        psaveId: cDto.psaveId,
        feel: cDto.feel,
      };
      if (cDto.noteId) {
        message.noteId = cDto.noteId;
        message.type = MessageReturnTypes.CLOCK_NOTE;
      } else {
        message.type = MessageReturnTypes.CLOCK_POINT;
      }
      await this.msgService.message(pointsave.userId, message, MessageQueryTypes.CLOCK);
    } catch (err) {
      throw err;
    } finally {
      await this.redisService.unlock(key);
    }

    return true;
  }

  /**
   * 检查是否针对一个点位收藏当天进行了打卡
   */
  async checkOne(findData: FindConditions<UserClockEntity>): Promise<any> {
    const clock = await this.findOneNotException(findData, ['updatedAt']);
    const midnight = UtilsService.midnight();
    if (clock && midnight < clock.updatedAt) {
      return true;
    } else {
      return false;
    }
  }
}
