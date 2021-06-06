import { UtilsService } from '@rehuo/common/providers/utils.service';
import { v4 as uuidv4 } from 'uuid';
import { MediaTypes } from '../types/media.constant';
import { IMedia } from '../types/media.interface';

/**
 * 负责对所有类型图片或者视频进行路径处理
 */
export class MediaNameService {
  /**
   * 生成所有类型图片或者视频的存储路径
   */
  static Path(type: MediaTypes, media: IMedia, date: string): string {
    let path;

    switch (type) {
      case MediaTypes.POINTNOTE_VIDEO:
      case MediaTypes.POINTNOTE_IMAGES:
        path = `U${media.createrId}/${date}/${type}`;
        break;
      default:
        throw new Error();
    }
    return path;
  }

  /**
   * 生成包含存储路径的文件名
   */
  static Name(type: MediaTypes, media: IMedia): string {
    const now = new Date();
    const date = UtilsService.formatDate(now);
    const time = UtilsService.formatTime(now);
    const name: string = MediaNameService.Path(type, media, date);
    return name + uuidv4().split('-')[4] + '-' + time;
  }

  /**
   * 生成多个包含存储路径的文件名
   */
  static Names(type: MediaTypes, amount: number, media: IMedia): string[] {
    const names: string[] = [];
    const now = new Date();
    const date = UtilsService.formatDate(now);
    const time = UtilsService.formatTime(now);

    const path: string = MediaNameService.Path(type, media, date);

    for (let i = 0; i < amount; i++) {
      names.push(path + uuidv4().split('-')[4] + '-' + time);
    }

    return names;
  }

  /**
   * 解析出原来的参数
   */
  static resolver(media: string): any {
    try {
      const splits = media.split('/');
      return {
        createrId: parseInt(splits[0].slice(1), 10),
      };
    } catch (err) {
      return null;
    }
  }
}
