import { ApiProperty } from '@nestjs/swagger';
import { SystemConstants } from '@rehuo/common/constants/system.constant';
import { PageRequestDTO } from '@rehuo/common/dtos/page.request.dto';
import {
  IsBooleanString,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';

/**
 * 创建点位分类DTO
 */
export class PointSortCreateDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(SystemConstants.LITTLE_LENGTH)
  @ApiProperty({
    type: String,
    maxLength: SystemConstants.LITTLE_LENGTH,
    description: '分类名称',
  })
  readonly name: string;

  userId: number;
}

/**
 * 更新点位分类DTO
 */
export class PointSortUpdateDTO {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    type: Number,
    minimum: -1,
    description: '点位分类ID',
  })
  sortId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(SystemConstants.LITTLE_LENGTH)
  @ApiProperty({
    type: String,
    maxLength: SystemConstants.LITTLE_LENGTH,
    description: '分类名称',
  })
  readonly name: string;

  userId: number;
}

/**
 * 更新点位分类DTO
 */
export class PointSortGetPointsDTO extends PageRequestDTO {
  @IsNumberString()
  @IsNotEmpty()
  @ApiProperty({
    type: Number,
    minimum: 1,
    description: '用户ID',
  })
  readonly userId: number;

  @IsBooleanString()
  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({
    type: Boolean,
    required: false,
    description:
      '是否有文章, 查看有文章则为true，没有文章则为false。如果查看全部，则不传值',
  })
  readonly isNote: boolean;

  @IsNumberString()
  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({
    type: Number,
    minimum: 0,
    required: false,
    description:
      '分类ID，如果输入了分类ID，则返回该用户对应分类下的点位极简信息，如果不输入则默认为全部点位',
  })
  readonly sortId: number;
}

/**
 * 获取点位分类DTO
 */
export class PointSortsGetDTO extends PageRequestDTO {
  @IsNumberString()
  @IsNotEmpty()
  @ApiProperty({
    type: Number,
    minimum: 1,
    description: '用户ID',
  })
  readonly userId: number;
}

/**
 * 删除点位分类
 */
export class PointSortDeleteDTO {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    type: Number,
    minimum: 1,
    description: '点位分类ID',
  })
  sortId: number;
}

/**
 * 获取点位分类DTO
 */
export class PointSortGetDTO {
  @IsNumberString()
  @IsNotEmpty()
  @ApiProperty({
    type: Number,
    minimum: -1,
    description: '分类ID',
  })
  readonly sortId: number;

  @IsNumberString()
  @IsNotEmpty()
  @ApiProperty({
    type: Number,
    minimum: 1,
    description: '地图创建者ID',
  })
  readonly createrId: number;
}

/**
 * 更新点位分类DTO(仅后台审核人员)
 */
export class PointSortUpdateByAuditorDTO {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    type: Number,
    minimum: -1,
    description: '点位分类ID',
  })
  sortId: number;

  @IsNotEmpty()
  @IsString()
  @Length(6)
  @ApiProperty({
    type: String,
    minLength: 6,
    maxLength: 6,
    description: '城市编码',
  })
  cityCode: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @MaxLength(SystemConstants.LITTLE_LENGTH)
  @ApiProperty({
    type: String,
    maxLength: SystemConstants.LITTLE_LENGTH,
    description: '分类名称',
  })
  readonly name: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @MaxLength(SystemConstants.LITTLE_LENGTH)
  @ApiProperty({
    type: String,
    maxLength: SystemConstants.LITTLE_LENGTH,
    description: '分类名称',
  })
  readonly logo: string;
}

/**
 * 获取公共地图中城市的点位分类DTO
 */
export class CitySortsGetDTO {
  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  @MaxLength(6)
  @ApiProperty({
    type: String,
    minimum: 4,
    maximum: 6,
    description: '城市编码',
  })
  readonly cityCode: string;
}
