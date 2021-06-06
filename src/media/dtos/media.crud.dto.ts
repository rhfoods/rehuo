import { ApiProperty } from '@nestjs/swagger';
import { SystemConstants } from '@rehuo/common/constants/system.constant';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  Max,
  Min,
} from 'class-validator';
import { MediaTypes } from '../types/media.constant';

/**
 * 媒体上传DTO
 */
export class MediaCreateDTO {
  @IsEnum(MediaTypes)
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    enum: MediaTypes,
    description: '媒体类型',
  })
  readonly type: MediaTypes;

  @IsNumber()
  @IsNotEmpty()
  @Min(SystemConstants.IMAGE_UPLOAD_MIN_COUNT)
  @Max(SystemConstants.IMAGE_UPLOAD_MAX_COUNT)
  @ApiProperty({
    type: Number,
    minimum: SystemConstants.IMAGE_UPLOAD_MIN_COUNT,
    maximum: SystemConstants.IMAGE_UPLOAD_MAX_COUNT,
    description: '图片数量',
  })
  readonly counts: number;

  createrId: number;
}

/**
 * 媒体删除DTO
 */
export class MediaDeleteDTO {
  @IsArray()
  @ArrayMinSize(SystemConstants.IMAGE_UPLOAD_MIN_COUNT)
  @ArrayMaxSize(SystemConstants.IMAGE_UPLOAD_MAX_COUNT)
  @IsNotEmpty()
  @Type(() => String)
  @ApiProperty({
    type: [String],
    isArray: true,
    minimum: SystemConstants.IMAGE_UPLOAD_MIN_COUNT,
    maximum: SystemConstants.IMAGE_UPLOAD_MAX_COUNT,
    description: '媒体存储路径和名称',
  })
  readonly medias: string[];

  createrId?: number;
}
