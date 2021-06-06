import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import {
  MessageQueryTypes,
  SystemMessageTypes,
} from '@rehuo/common/constants/message.constant';
import { RedisNames } from '@rehuo/common/constants/redis.constant';
import { DBService } from '@rehuo/common/db/db.service';
import { ISystemMessage } from '@rehuo/common/interfaces/message.interface';
import { UtilsService } from '@rehuo/common/providers/utils.service';
import { MessageService } from '@rehuo/message/message.service';
import { PointRecommendEntity } from '@rehuo/models/point.recommend.entity';
import { RedisService } from '@rehuo/redis/redis.service';
import { UserService } from '@rehuo/user/services/user.service';
import { Connection, Repository } from 'typeorm';
import {
  PointRecommendAuditDTO,
  PointRecommendCreateDTO,
} from './dtos/point.recommend.crud.dto';

@Injectable()
export class PointRecommendService extends DBService<PointRecommendEntity> {
  constructor(
    @InjectRepository(PointRecommendEntity)
    private prRepo: Repository<PointRecommendEntity>,
    @InjectConnection()
    private readonly connection: Connection,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => RedisService))
    private readonly redisService: RedisService,
    @Inject(forwardRef(() => MessageService))
    private readonly msgService: MessageService,
  ) {
    super(prRepo, PointRecommendService.name);
  }

  /**
   * 新建点位推荐
   */
  async createOne(cDto: PointRecommendCreateDTO): Promise<boolean> {
    const key = UtilsService.format(RedisNames.POINT_RECOMMEND_LOCKED, cDto.userId);

    try {
      if (!(await this.redisService.lock(key))) {
        return false;
      }

      await this.create(cDto);
      if (cDto.toUserId) {
        const message: ISystemMessage = {
          userId: cDto.userId,
          type: SystemMessageTypes.POINT_RECOMMEND_USERS,
          name: cDto.name,
          address: cDto.address,
        };
        await this.msgService.message(cDto.toUserId, message, MessageQueryTypes.SYSTEM);
      }
      return true;
    } catch (err) {
      throw err;
    } finally {
      await this.redisService.unlock(key);
    }
  }

  /**
   * 点位推荐审核
   */
  async audit(uDto: PointRecommendAuditDTO): Promise<boolean> {
    const key = UtilsService.format(
      RedisNames.POINT_RECOMMEND_AUDIT_LOCKED,
      uDto.auditorId,
    );

    try {
      if (!(await this.redisService.lock(key))) {
        return false;
      }

      const recommend = await this.findOne({ prId: uDto.prId }, ['name', 'userId']);
      const updateData = uDto.auditInfo
        ? { isAudit: true, isPassed: uDto.isPassed, auditInfo: uDto.auditInfo }
        : { isAudit: true, isPassed: uDto.isPassed };
      await this.update({ prId: uDto.prId }, updateData);
      const message: ISystemMessage = {
        userId: 0,
        type: SystemMessageTypes.POINT_RECOMMENDS,
        name: recommend.name,
        isPassed: uDto.isPassed,
        description: uDto.auditInfo,
      };
      await this.msgService.message(recommend.userId, message, MessageQueryTypes.SYSTEM);
      return true;
    } catch (err) {
      throw err;
    } finally {
      await this.redisService.unlock(key);
    }
  }
}
