import { ApiProperty } from '@nestjs/swagger';
import { MapPointFieldLengths } from '@rehuo/common/constants/point.constant';
import { SystemConstants } from '@rehuo/common/constants/system.constant';
import { PageRequestDTO } from '@rehuo/common/dtos/page.request.dto';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * 收藏点位DTO
 */
export class PointSaveCreateDTO {
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @ApiProperty({
    type: Number,
    minimum: 1,
    description: '点位收藏ID',
  })
  readonly psaveId: number;

  userId: number;
}

/**
 * 更新点位收藏DTO
 */
export class PointSaveUpdateDTO {
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
  @MaxLength(MapPointFieldLengths.TAG)
  @IsOptional()
  @ApiProperty({
    type: String,
    required: false,
    maxLength: MapPointFieldLengths.TAG,
    description: '点位标签',
  })
  readonly tag: string;

  @IsNumber()
  @IsNotEmpty()
  @Transform(v => (v === null ? 0 : v))
  @IsOptional()
  @ApiProperty({
    type: Number,
    required: false,
    minimum: 0,
    description: '人均价',
  })
  readonly price: number;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({
    type: String,
    required: false,
    description: 'LOGO存储位置',
  })
  readonly logo: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @IsOptional()
  @ApiProperty({
    type: Number,
    minimum: 0,
    required: false,
    description: '对应分类ID，为0表示默认分类',
  })
  readonly sortId: number;
}

/**
 * 删除点位收藏DTO
 */
export class PointSaveDeleteDTO {
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @ApiProperty({
    type: Number,
    minimum: 1,
    description: '点位收藏ID',
  })
  readonly psaveId: number;
}

/**
 * 置顶文章DTO
 */
export class PointNoteSetTopDTO {
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @ApiProperty({
    type: Number,
    minimum: 1,
    description: '点位收藏ID',
  })
  readonly psaveId: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @ApiProperty({
    type: Number,
    minimum: 1,
    description: '置顶的文章ID',
  })
  readonly noteId: number;

  userId: number;
}

/**
 * 获取点位收藏DTO
 */
export class PointSaveGetDTO {
  @IsNumberString()
  @IsNotEmpty()
  @ApiProperty({
    type: Number,
    minimum: 1,
    description: '点位收藏ID',
  })
  readonly psaveId: number;
}

/**
 * 获取点位收藏DTO
 */
export class PointSaveGetMoreDTO {
  @IsNumberString()
  @IsNotEmpty()
  @ApiProperty({
    type: Number,
    minimum: 1,
    description: '点位收藏ID',
  })
  readonly psaveId: number;

  @IsEnum(['M', 'O'])
  @IsNotEmpty()
  @ApiProperty({
    enum: ['M', 'O'],
    type: String,
    description: 'M表示我的地图，O表示其它人的地图',
  })
  readonly mo: string;

  userId: number;
}

/**
 * 获取用户的发现DTO
 */
export class PointSaveGetMyDTO extends PageRequestDTO {
  @IsNumberString()
  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({
    type: Number,
    minimum: 1,
    description: '用户ID',
  })
  userId: number;
}
