import { ApiProperty } from '@nestjs/swagger';
import { MapPointFieldLengths } from '@rehuo/common/constants/point.constant';
import { SystemConstants } from '@rehuo/common/constants/system.constant';
import { Transform } from 'class-transformer';
import {
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * 创建点位DTO
 */
export class MapPointCreateDTO {
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

  @IsString()
  @IsNotEmpty()
  @MaxLength(MapPointFieldLengths.TAG)
  @ApiProperty({
    type: String,
    maxLength: MapPointFieldLengths.TAG,
    description: '点位标签',
  })
  readonly tag: string;

  @IsNumber()
  @IsOptional()
  @Transform(v => (v === null ? 0 : v))
  @ApiProperty({
    type: Number,
    required: false,
    minimum: 0,
    description: '人均价',
  })
  readonly price: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @ApiProperty({
    type: Number,
    minimum: 0,
    description: '对应分类ID, 为0表示默认分类',
  })
  readonly sortId: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: 'LOGO存储位置',
  })
  readonly logo: string;

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

  userId: number;
}

/**
 * 更新点位DTO
 */
export class MapPointUpdateDTO {
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @ApiProperty({
    type: Number,
    minimum: 1,
    description: '点位收藏ID',
  })
  readonly psaveId: number;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @MaxLength(SystemConstants.NORMAL_LENGTH)
  @ApiProperty({
    type: String,
    maxLength: SystemConstants.NORMAL_LENGTH,
    description: '点位名称',
    required: false,
  })
  readonly name: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @MaxLength(512)
  @ApiProperty({
    type: String,
    maxLength: 512,
    description: '点位地址',
    required: false,
  })
  readonly address: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @MaxLength(MapPointFieldLengths.TAG)
  @ApiProperty({
    type: String,
    maxLength: MapPointFieldLengths.TAG,
    description: '点位标签',
    required: false,
  })
  readonly tag: string;

  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  @Transform(v => (v === null ? 0 : v))
  @ApiProperty({
    type: Number,
    required: false,
    minimum: 0,
    description: '人均价',
  })
  readonly price: number;

  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  @Min(0)
  @ApiProperty({
    type: Number,
    minimum: 0,
    description: '对应分类ID',
    required: false,
  })
  readonly sortId: number;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({
    type: String,
    description: 'LOGO存储位置',
    required: false,
  })
  readonly logo: string;

  @IsNumber()
  @IsLongitude()
  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({
    type: Number,
    description: '点位经度',
    required: false,
  })
  readonly longitude: number;

  @IsNumber()
  @IsLatitude()
  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({
    type: Number,
    description: '点位纬度',
    required: false,
  })
  readonly latitude: number;
}

/**
 * 获取点位DTO
 */
export class MapPointGetDTO {
  @IsNumberString()
  @IsNotEmpty()
  @ApiProperty({
    type: Number,
    minimum: 1,
    description: '点位ID',
  })
  readonly pointId: number;

  @IsNumberString()
  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({
    type: Number,
    minimum: 1,
    required: false,
    description:
      '用户ID, 如果输入了用户ID，则返回点位基本信息和用户收藏的信息。不然则返回点位基本信息',
  })
  readonly userId: number;
}
