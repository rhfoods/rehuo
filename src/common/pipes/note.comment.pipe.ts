import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { NoteCommentCreateDTO } from '@rehuo/map/modules/point/modules/note/dtos/note.comment.crud.dto';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { ERRORS } from '../constants/error.constant';
import { NoteCommentTypes } from '../constants/note.constant';

@Injectable()
export class NoteCommentPipe implements PipeTransform<any> {
  validate(value: NoteCommentCreateDTO) {
    if (value.type === NoteCommentTypes.ANSWER && !value.fatherId) {
      throw new BadRequestException(ERRORS.PARAMS_INVALID);
    }

    if (value.type === NoteCommentTypes.REPLY && (!value.fatherId || !value.upId)) {
      throw new BadRequestException(ERRORS.PARAMS_INVALID);
    }
  }

  async transform(
    value: NoteCommentCreateDTO,
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
