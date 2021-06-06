import { ApiProperty } from '@nestjs/swagger';
import { MapPointFieldLengths } from '@rehuo/common/constants/point.constant';
import { SystemConstants } from '@rehuo/common/constants/system.constant';
import { IdsRequestDTO } from '@rehuo/common/dtos/id.request.dto';
import { PageRequestDTO } from '@rehuo/common/dtos/page.request.dto';
import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsBooleanString,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * 创建文章DTO
 */
export class PointNoteCreateDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(MapPointFieldLengths.NOTE_TITLE)
  @ApiProperty({
    type: String,
    maxLength: MapPointFieldLengths.NOTE_TITLE,
    description: '文章标题',
  })
  readonly title: string;

  @IsString()
  @IsNotEmpty()
  @Transform(v => (v === null ? '' : v))
  @IsOptional()
  @MaxLength(MapPointFieldLengths.NOTE_CONTENT)
  @ApiProperty({
    type: String,
    required: false,
    maxLength: MapPointFieldLengths.NOTE_CONTENT,
    description: '文章内容',
  })
  readonly content: string;

  @IsArray()
  @ArrayMaxSize(SystemConstants.IMAGE_UPLOAD_MAX_COUNT)
  @IsOptional()
  @ApiProperty({
    type: [String],
    required: false,
    description: '文章图片或者视频列表，最多可以上传9张图片',
  })
  readonly medias: string[];

  @IsArray()
  @ArrayMaxSize(4)
  @IsOptional()
  @ApiProperty({
    type: [String],
    required: false,
    description: '场景描述',
  })
  readonly scenes: string[];

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    required: false,
    description: 'B站链接',
  })
  readonly blLink: string;

  @IsUrl()
  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    required: false,
    description: '微博链接',
  })
  readonly wbLink: string;

  @IsUrl()
  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    required: false,
    description: '小红书链接',
  })
  readonly xhsLink: string;

  @IsBoolean()
  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({
    type: Boolean,
    description: '是否推荐给公共地图',
    required: false,
  })
  readonly isRecom: boolean;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @ApiProperty({
    type: Number,
    minimum: 1,
    description: '对应点位收藏ID',
  })
  readonly psaveId: number;

  userId: number;
}

/**
 * 更新文章DTO
 */
export class PointNoteUpdateDTO {
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @ApiProperty({
    type: Number,
    minimum: 1,
    description: '文章ID',
  })
  readonly noteId: number;

  @IsString()
  @Transform(v => (v === null ? '' : v))
  @IsOptional()
  @IsNotEmpty()
  @MaxLength(MapPointFieldLengths.NOTE_TITLE)
  @ApiProperty({
    type: String,
    required: false,
    maximum: MapPointFieldLengths.NOTE_TITLE,
    description: '文章标题',
  })
  readonly title: string;

  @IsString()
  @IsNotEmpty()
  @Transform(v => (v === null ? '' : v))
  @IsOptional()
  @MaxLength(MapPointFieldLengths.NOTE_CONTENT)
  @ApiProperty({
    type: String,
    required: false,
    maximum: MapPointFieldLengths.NOTE_CONTENT,
    description: '文章内容',
  })
  readonly content: string;

  @IsArray()
  @ArrayMaxSize(SystemConstants.IMAGE_UPLOAD_MAX_COUNT)
  @IsOptional()
  @ApiProperty({
    type: [String],
    required: false,
    description: '文章图片或者视频列表，最多可以上传9张图片',
  })
  readonly medias: string[];

  @IsArray()
  @ArrayMaxSize(4)
  @IsOptional()
  @ApiProperty({
    type: [String],
    required: false,
    description: '场景描述',
  })
  readonly scenes: string[];

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    required: false,
    description: 'B站链接',
  })
  readonly blLink: string;

  @IsUrl()
  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    required: false,
    description: '微博链接',
  })
  readonly wbLink: string;

  @IsUrl()
  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    required: false,
    description: '小红书链接',
  })
  readonly xhsLink: string;
}

/**
 * 删除文章DTO
 */
export class PointNoteDeleteDTO {
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @ApiProperty({
    type: Number,
    minimum: 1,
    description: '文章ID',
  })
  readonly noteId: number;

  userId: number;
}

/**
 * 查看文章DTO
 */
export class PointNoteGetDTO {
  @IsNumberString()
  @IsNotEmpty()
  @ApiProperty({
    type: Number,
    minimum: 1,
    description: '文章ID',
  })
  readonly noteId: number;
}

/**
 * 查看多篇文章DTO
 */
export class PointNoteGetsDTO extends IdsRequestDTO {
  userId: number;
}

/**
 * 查看多篇文章DTO
 */
export class PointNoteGetMoreDTO extends PageRequestDTO {
  @IsNumberString()
  @IsNotEmpty()
  @ApiProperty({
    type: Number,
    minimum: 1,
    description: '点位收藏ID',
  })
  readonly psaveId: number;

  userId: number;
}

/**
 * 文章点赞或者取消点赞DTO
 */
export class PointNoteLikeDTO {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    type: Number,
    description: '文章ID',
  })
  readonly noteId: number;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({
    type: Boolean,
    description: 'true为点赞，false为取消点赞',
  })
  readonly isLiked: boolean;

  userId: number;
}

/**
 * 文章收藏/取消收藏
 */
export class PointNoteSaveDTO {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    type: Number,
    description: '文章ID',
  })
  readonly noteId: number;

  userId: number;
}

/**
 * 查看不同状态的所有文章信息
 */
export class PointNoteGetAllDTO extends PageRequestDTO {
  @IsBooleanString()
  @IsNotEmpty()
  @ApiProperty({
    type: Boolean,
    description: '文章被审核的状态',
  })
  readonly isAudit: boolean;
}

/**
 * 查看不同状态的所有文章信息
 */
export class PointNoteAuditDTO {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    type: Number,
    description: '文章ID号',
  })
  readonly noteId: number;
}
