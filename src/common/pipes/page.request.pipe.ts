import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { SqlOrderTypes } from '../constants/sql.constant';
import { SystemConstants } from '../constants/system.constant';
import { PageRequestDTO } from '../dtos/page.request.dto';
@Injectable()
export class PageRequestPipe implements PipeTransform<any> {
  async transform(value: PageRequestDTO, { metatype }: ArgumentMetadata): Promise<any> {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const obj = plainToClass(metatype, value);
    const errors = await validate(obj);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    value.order ? null : (value.order = SqlOrderTypes.DESC);
    value.start ? null : (value.start = 0);
    value.take ? null : (value.take = SystemConstants.SQLDB_QUERY_PAGE_COUNT_DEFAULT);
    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
