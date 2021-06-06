import { ApiProperty } from '@nestjs/swagger';
import {
  NoteCommentTypes,
  NOTE_COMMENT_MAX,
} from '@rehuo/common/constants/note.constant';
import { PageRequestDTO } from '@rehuo/common/dtos/page.request.dto';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

/**
 * 创建评论DTO
 */
export class NoteCommentCreateDTO {
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @ApiProperty({
    type: Number,
    minimum: 1,
    description: '文章ID',
  })
  readonly noteId: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @IsOptional()
  @ApiProperty({
    type: Number,
    minimum: 1,
    required: false,
    description: '评论父ID号',
  })
  readonly fatherId: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @IsOptional()
  @ApiProperty({
    type: Number,
    minimum: 1,
    required: false,
    description: '评论的上一级ID号',
  })
  readonly upId: number;

  @IsEnum(NoteCommentTypes)
  @IsNotEmpty()
  @ApiProperty({
    enum: NoteCommentTypes,
    type: String,
    description: '评论类型',
  })
  readonly type: NoteCommentTypes;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(NOTE_COMMENT_MAX)
  @ApiProperty({
    type: String,
    maxLength: NOTE_COMMENT_MAX,
    minLength: 1,
    description: '评论内容',
  })
  readonly comment: string;

  userId: number;
}

/**
 * 删除评论DTO
 */
export class NoteCommentDeleteDTO {
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @ApiProperty({
    type: Number,
    minimum: 1,
    description: '文章ID',
  })
  readonly noteId: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @ApiProperty({
    type: Number,
    minimum: 1,
    description: '评论ID',
  })
  readonly commentId: number;

  userId: number;
}

/**
 * 查看评论DTO
 */
export class NoteCommentGetAllDTO extends PageRequestDTO {
  @IsNumberString()
  @IsNotEmpty()
  @ApiProperty({
    type: Number,
    minimum: 1,
    description: '文章Id号',
  })
  readonly noteId: number;

  userId: number;
}

/**
 * 查看子评论DTO
 */
export class NoteCommentGetSubAllDTO extends PageRequestDTO {
  @IsNumberString()
  @IsNotEmpty()
  @ApiProperty({
    type: Number,
    minimum: 1,
    description: '子评论ID号',
  })
  readonly commentId: number;

  @IsNumberString()
  @IsNotEmpty()
  @ApiProperty({
    type: Number,
    minimum: 1,
    description: '子评论条数',
  })
  readonly counts: number;

  userId: number;
}

/**
 * 评论点赞或者取消点赞DTO
 *
 */
export class NoteCommentLikeDTO {
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @ApiProperty({
    type: Number,
    minimum: 1,
    description: '评论ID',
  })
  readonly commentId: number;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({
    type: Boolean,
    description: 'true为点赞，false为取消点赞',
  })
  readonly isLiked: boolean;

  userId: number;
}
