import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { OssOperateTypes, OssSessionNames } from '@rehuo/common/constants/oss.constant';
import { RedisNames } from '@rehuo/common/constants/redis.constant';
import { UtilsService } from '@rehuo/common/providers/utils.service';
import { RedisService } from '@rehuo/redis/redis.service';
import { OssService } from '@rehuo/shared/services/oss.service';
import { MediaCreateDTO, MediaDeleteDTO } from '../dtos/media.crud.dto';
import { MediaTypes } from '../types/media.constant';
import { IPointNoteMedia } from '../types/media.interface';
import { MediaNameService } from './media.name.service';

@Injectable()
export class MediaService {
  constructor(
    private readonly ossService: OssService,
    @Inject(forwardRef(() => RedisService))
    private readonly redisService: RedisService,
  ) {}

  /**
   * 生成点位媒体存储路径及名称
   */
  async create(cDto: MediaCreateDTO): Promise<any> {
    const key = UtilsService.format(RedisNames.USER_ADD_MEDIA_LOCKED, cDto.createrId);

    try {
      let mediaNames: string[];
      const media: IPointNoteMedia = {
        createrId: cDto.createrId,
      };
      if (!(await this.redisService.lock(key))) {
        return;
      }

      if (cDto.counts === 1) {
        mediaNames = [MediaNameService.Name(cDto.type as MediaTypes, media)];
      } else {
        mediaNames = MediaNameService.Names(cDto.type as MediaTypes, cDto.counts, media);
      }

      return {
        sts: await this.ossService.generateSTS(
          OssOperateTypes.READWRITE,
          OssSessionNames.DEFAULT,
        ),
        medias: mediaNames,
      };
    } catch (err) {
      throw err;
    } finally {
      await this.redisService.unlock(key);
    }
  }

  /**
   * 删除点位媒体
   */
  async delete(dDto: MediaDeleteDTO): Promise<boolean> {
    const medias = dDto.medias.filter(name => {
      const ids: any = MediaNameService.resolver(name);
      if (ids && ids.createrId === dDto.createrId) {
        return true;
      } else {
        return false;
      }
    });

    await this.ossService.deleteMedias(medias);
    return true;
  }
}
