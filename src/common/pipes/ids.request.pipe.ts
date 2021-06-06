import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { isNumberString, validate } from 'class-validator';
import { ERRORS } from '../constants/error.constant';
import { IdsRequestDTO } from '../dtos/id.request.dto';

@Injectable()
export class IdsRequestPipe implements PipeTransform<any> {
  async transform(value: IdsRequestDTO, { metatype }: ArgumentMetadata): Promise<any> {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToClass(metatype, value);
    const errors = await validate(object);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    const ids = value.ids.split(':');
    ids.forEach(id => {
      if (!isNumberString(id) || Number(id) <= 0) {
        throw new BadRequestException(ERRORS.PARAMS_INVALID);
      }
    });
    value.idsArray = ids;

    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
