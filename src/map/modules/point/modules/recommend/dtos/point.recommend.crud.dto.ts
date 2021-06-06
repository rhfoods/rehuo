import { ApiProperty } from '@nestjs/swagger';
import { MapPointFieldLengths } from '@rehuo/common/constants/point.constant';
import { SystemConstants } from '@rehuo/common/constants/system.constant';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

/**
 * 点位推荐DTO
 */
export class PointRecommendCreateDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(SystemConstants.NORMAL_LENGTH)
  @ApiProperty({
    type: String,
    maxLength: SystemConstants.NORMAL_LENGTH,
    description: '点位名称',
  })
  readonly name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  @ApiProperty({
    type: String,
    maxLength: 512,
    description: '点位地址',
  })
  readonly address: string;

  @IsNumber()
  @IsLongitude()
  @IsNotEmpty()
  @ApiProperty({
    type: Number,
    description: '点位经度',
  })
  readonly longitude: number;

  @IsNumber()
  @IsLatitude()
  @IsNotEmpty()
  @ApiProperty({
    type: Number,
    description: '点位纬度',
  })
  readonly latitude: number;

  @IsArray()
  @ArrayMaxSize(SystemConstants.IMAGE_UPLOAD_MAX_COUNT)
  @IsOptional()
  @ApiProperty({
    type: [String],
    required: false,
    description: '文章图片，最多可以上传9张图片',
  })
  readonly medias: string[];

  @IsString()
  @IsNotEmpty()
  @MaxLength(MapPointFieldLengths.RECOMMEND_REASON)
  @ApiProperty({
    type: String,
    maxLength: MapPointFieldLengths.RECOMMEND_REASON,
    description: '推荐理由',
  })
  readonly reason: string;

  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({
    type: Number,
    required: false,
    description: '被推荐者ID号',
  })
  readonly toUserId: number;

  userId: number;
}

/**
 * 点位推荐审核DTO
 */
export class PointRecommendAuditDTO {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    type: Number,
    description: '点位推荐ID',
  })
  readonly prId: number;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({
    type: Boolean,
    description: '是否审核通过',
  })
  readonly isPassed: boolean;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @MaxLength(MapPointFieldLengths.RECOMMEND_REASON)
  @ApiProperty({
    type: String,
    maxLength: MapPointFieldLengths.RECOMMEND_REASON,
    required: false,
    description: '是否通过的理由',
  })
  readonly auditInfo: string;

  auditorId: number;
}
