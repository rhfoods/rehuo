import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { PointRecommendAuditDTO } from '@rehuo/map/modules/point/modules/recommend/dtos/point.recommend.crud.dto';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { ERRORS } from '../constants/error.constant';

@Injectable()
export class PointRecommendAuditPipe implements PipeTransform<any> {
  validate(value: PointRecommendAuditDTO) {
    if (!value.isPassed && !value.auditInfo) {
      throw new BadRequestException(ERRORS.PARAMS_INVALID);
    }
  }

  async transform(
    value: PointRecommendAuditDTO,
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
