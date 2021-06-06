import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { MapShareTypes } from '@rehuo/common/constants/point.constant';
import { NoteStatFields, RedisNames } from '@rehuo/common/constants/redis.constant';
import { DBService } from '@rehuo/common/db/db.service';
import { UtilsService } from '@rehuo/common/providers/utils.service';
import { MapShareEntity } from '@rehuo/models/map.share.entity';
import { PointSaveEntity } from '@rehuo/models/point.save.entity';
import { PointSaveStatEntity } from '@rehuo/models/point.save.stat.entity';
import { UserStatEntity } from '@rehuo/models/user.stat.entity';
import { RedisService } from '@rehuo/redis/redis.service';
import { Connection, Repository } from 'typeorm';
import { NoteStatService } from '../point/modules/note/services/note.stat.service';
import { MapShareCreateDTO } from './dtos/map.share.crud.dto';

@Injectable()
export class MapShareService extends DBService<MapShareEntity> {
  constructor(
    @InjectRepository(MapShareEntity)
    private msRepo: Repository<MapShareEntity>,
    @Inject(forwardRef(() => NoteStatService))
    private nstatService: NoteStatService,
    @Inject(forwardRef(() => RedisService))
    private redisService: RedisService,
    @InjectConnection()
    private readonly connection: Connection,
  ) {
    super(msRepo, MapShareService.name);
  }

  /**
   * 统计分享数据
   */
  async createOne(cDto: MapShareCreateDTO): Promise<any> {
    let type: MapShareTypes, commonId;
    if (cDto.createrId) {
      type = MapShareTypes.MAP;
      commonId = cDto.createrId;
    } else if (cDto.psaveId) {
      type = MapShareTypes.POINT;
      commonId = cDto.psaveId;
    } else if (cDto.noteId) {
      type = MapShareTypes.NOTE;
      commonId = cDto.noteId;
    }

    const key = UtilsService.format(RedisNames.MAP_SHARE_LOCKED, cDto.userId, commonId);
    try {
      if (!(await this.redisService.lock(key))) {
        return;
      }
      await this.connection.transaction('READ COMMITTED', async txEntityManager => {
        const share = await txEntityManager.findOne(
          MapShareEntity,
          { userId: cDto.userId, type, commonId },
          { select: ['shareId'] },
        );
        if (!share) {
          const newShare = new MapShareEntity();
          newShare.userId = cDto.userId;
          newShare.type = type;
          newShare.commonId = commonId;
          await txEntityManager.save(MapShareEntity, newShare);
        } else {
          await txEntityManager.increment(
            MapShareEntity,
            { userId: cDto.userId, type, commonId },
            'counts',
            1,
          );
        }
        switch (type) {
          case MapShareTypes.MAP:
            await txEntityManager.increment(
              UserStatEntity,
              { userId: cDto.userId },
              'mapShares',
              1,
            );
            break;
          case MapShareTypes.NOTE:
            await this.nstatService.updateStat(commonId, NoteStatFields.SHARES, 1);
            break;
          case MapShareTypes.POINT:
            const pointsave = await txEntityManager.findOne(
              PointSaveEntity,
              { psaveId: commonId },
              { select: ['ffpsaveId'] },
            );
            await txEntityManager.increment(
              PointSaveStatEntity,
              { psaveId: pointsave.ffpsaveId },
              'shares',
              1,
            );
            break;
          default:
            break;
        }
      });
    } catch (err) {
      throw err;
    } finally {
      await this.redisService.unlock(key);
    }
  }
}
