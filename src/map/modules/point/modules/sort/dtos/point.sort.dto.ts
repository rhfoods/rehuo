import { ApiProperty } from '@nestjs/swagger';
import { BaseDTO } from '@rehuo/common/dtos/base.response.dto';
import { PageResponseDTO } from '@rehuo/common/dtos/page.response.dto';
import { Exclude, Expose, Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

/**
 * 点位分类信息
 */
@Exclude()
export class PointSortInternalDTO {
  @Expose()
  @ApiProperty({
    type: Number,
    description: '分类ID',
  })
  sortId: number;

  @Expose()
  @ApiProperty({
    type: String,
    description: '分类信息',
  })
  name: string;

  @Expose()
  @ApiProperty({
    type: String,
    description: '分类显示的LOGO',
  })
  logo: string;

  @Expose()
  @ApiProperty({
    type: Number,
    description: '对应点位数',
  })
  points: number;
}

/**
 * 点位分类列表DTO
 */
export class PointSortDTO extends BaseDTO {
  constructor() {
    super();
  }

  @ValidateNested({ each: true })
  @Type(() => PointSortInternalDTO)
  @ApiProperty({
    type: PointSortInternalDTO,
    description: '点位分类信息',
  })
  sort: PointSortInternalDTO;
}

/**
 * 点位分类列表DTO
 */
export class PointSortsDTO extends PageResponseDTO {
  constructor() {
    super();
  }

  @ValidateNested({ each: true })
  @Type(() => PointSortInternalDTO)
  @ApiProperty({
    type: [PointSortInternalDTO],
    description: '点位分类列表',
  })
  sorts: PointSortInternalDTO[];

  @ApiProperty({
    type: Number,
    description: '所有点位数量',
  })
  totalPoints: number;

  @ApiProperty({
    type: Number,
    description: '不属于分类的点位数量',
  })
  defaultPoints: number;
}

/**
 * 返回极简的点位信息
 */
@Exclude()
export class MapPointLittleInternalDTO {
  @Expose()
  @ApiProperty({
    type: Number,
    description: '点位收藏ID',
  })
  psaveId: number;

  @Expose()
  @ApiProperty({
    type: String,
    description: '点位收藏标签',
  })
  tag: string;

  @Expose()
  @ApiProperty({
    type: String,
    description: '点位名称',
  })
  name: string;

  @Expose()
  @ApiProperty({
    type: String,
    description: '点位地址',
  })
  address: string;

  @Expose()
  @ApiProperty({
    type: String,
    description: '点位收藏LOGO',
  })
  logo: string;

  @Expose()
  @ApiProperty({
    type: Number,
    description: '点位收藏价格',
  })
  price: number;

  @Expose()
  @ApiProperty({
    type: Number,
    description: '点位经度',
  })
  longitude: number;

  @Expose()
  @ApiProperty({
    type: Number,
    description: '点位纬度',
  })
  latitude: number;

  @Expose()
  @ApiProperty({
    type: Number,
    description: '分类ID',
  })
  sortId: number;

  @Expose()
  @ApiProperty({
    type: Number,
    description: '文章ID',
  })
  noteId: number;

  @Expose()
  @ApiProperty({
    type: Date,
    description: '创建时间',
  })
  createdAt: Date;
}

/**
 * 点位DTO数据
 */
export class MapPointLittlesDTO extends PageResponseDTO {
  constructor() {
    super();
  }

  @ApiProperty({
    type: [MapPointLittleInternalDTO],
    description: '点位极简信息列表',
  })
  points: MapPointLittleInternalDTO[];
}
