import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import {
  PointNoteCreateDTO,
  PointNoteUpdateDTO,
} from '@rehuo/map/modules/point/modules/note/dtos/point.note.crud.dto';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { ERRORS } from '../constants/error.constant';

@Injectable()
export class PointNotePipe implements PipeTransform<any> {
  validate(value: PointNoteCreateDTO | PointNoteUpdateDTO) {
    //视频、文章、图片必须三选一
    if (value instanceof PointNoteCreateDTO) {
      if (!value.content && value.medias && value.medias.length === 0) {
        throw new BadRequestException(ERRORS.PARAMS_INVALID);
      }
    }
    if (
      (value.blLink && !value.blLink.match(/^BV\w*/)) ||
      (value.wbLink &&
        !(value.wbLink.includes('weibo.cn') || value.wbLink.includes('weibo.com'))) ||
      (value.xhsLink && !value.xhsLink.match(/http[^，]*/))
    ) {
      throw new BadRequestException(ERRORS.PARAMS_INVALID);
    }
  }

  async transform(
    value: PointNoteCreateDTO | PointNoteUpdateDTO,
    { metatype }: ArgumentMetadata,
  ): Promise<any> {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const obj = plainToClass(metatype, value);
    const errors = await validate(obj);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    this.validate(value);

    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
