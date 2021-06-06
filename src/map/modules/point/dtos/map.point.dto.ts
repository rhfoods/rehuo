import { ApiProperty } from '@nestjs/swagger';
import { BaseDTO } from '@rehuo/common/dtos/base.response.dto';
import { MapPointInternalDTO } from '@rehuo/map/dtos/map.dto';
import { Exclude, Expose } from 'class-transformer';

/**
 * 返回包含收藏信息的点位信息
 */
@Exclude()
export class MapPointSaveInternalDTO extends MapPointInternalDTO {
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
    type: Number,
    required: false,
    description: '分类ID',
  })
  sortId: number;

  @Expose()
  @ApiProperty({
    type: Number,
    description: '人均价格',
  })
  price: number;

  @Expose()
  @ApiProperty({
    type: Number,
    required: false,
    description: '门店被收藏次数',
  })
  saves: number;

  @Expose()
  @ApiProperty({
    type: Number,
    required: false,
    description: '门店被点赞次数',
  })
  goods: number;

  @Expose()
  @ApiProperty({
    type: Number,
    required: false,
    description: '门店被踩踏次数',
  })
  bads: number;

  @Expose()
  @ApiProperty({
    type: Number,
    required: false,
    description: '门店被分享次数',
  })
  shares: number;

  @Expose()
  @ApiProperty({
    type: String,
    required: false,
    description: '所属分类的名称',
  })
  sortName: string;

  @Expose()
  @ApiProperty({
    type: Number,
    required: false,
    description: '点位创建者ID',
  })
  createrId: number;

  @Expose()
  @ApiProperty({
    type: Number,
    required: false,
    description: '点位收藏者ID',
  })
  userId: number;

  @Expose()
  @ApiProperty({
    type: Number,
    required: false,
    description: '如果存在，则为被收藏的ID',
  })
  newPsaveId: number;

  @Expose()
  @ApiProperty({
    type: Number,
    required: false,
    description: '如果存在，则对应发现的noteId',
  })
  newNoteId: number;

  @Expose()
  @ApiProperty({
    type: Boolean,
    required: false,
    description: '当日是否已经打卡',
  })
  isClocked: boolean;
}

/**
 * 返回包含收藏信息的点位信息DTO
 */
export class MapPointSaveDTO extends BaseDTO {
  constructor() {
    super();
  }

  @ApiProperty({
    type: MapPointSaveInternalDTO,
    description: '包含了收藏信息的点位信息',
  })
  point: MapPointSaveInternalDTO;
}
