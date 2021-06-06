import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { MapShareCreateDTO } from '@rehuo/map/modules/share/dtos/map.share.crud.dto';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { ERRORS } from '../constants/error.constant';
@Injectable()
export class MapSharePipe implements PipeTransform<any> {
  async transform(
    value: MapShareCreateDTO,
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

    let paramCount = 0;
    value.createrId ? paramCount++ : null;
    value.noteId ? paramCount++ : null;
    value.psaveId ? paramCount++ : null;

    if (paramCount === 0 || paramCount > 1) {
      throw new BadRequestException(ERRORS.PARAMS_INVALID);
    }

    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
