import { ApiProperty } from '@nestjs/swagger';
import { PageResponseDTO } from '@rehuo/common/dtos/page.response.dto';
import { MapPointInternalDTO } from '@rehuo/map/dtos/map.dto';
import { Exclude, Expose } from 'class-transformer';

/**
 * 返回简略的点位信息
 */
@Exclude()
export class MapPointNoteInternalDTO extends MapPointInternalDTO {
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
    description: '人均价',
  })
  price: number;

  @Expose()
  @ApiProperty({
    type: String,
    description: '文章标题',
  })
  title: string;

  @Expose()
  @ApiProperty({
    type: [String],
    description: '文章视频或者图片',
  })
  medias: string[];

  @Expose()
  @ApiProperty({
    type: String,
    description: '文章内容信息',
  })
  content: string;

  @Expose()
  @ApiProperty({
    type: Number,
    description: '门店被收藏次数',
  })
  saves: number;

  @Expose()
  @ApiProperty({
    type: Number,
    description: '门店被点赞次数',
  })
  goods: number;

  @Expose()
  @ApiProperty({
    type: Number,
    description: '门店被踩踏次数',
  })
  bads: number;

  @Expose()
  @ApiProperty({
    type: Number,
    description: '文章浏览次数',
  })
  views: number;

  @Expose()
  @ApiProperty({
    type: Number,
    description: '文章被置顶次数',
  })
  tops: number;

  @Expose()
  @ApiProperty({
    type: Number,
    description: '文章被点赞次数',
  })
  likes: number;

  @Expose()
  @ApiProperty({
    type: Date,
    description: '文章创建时间或者点位收藏时间',
  })
  updatedAt: Date;

  @Expose()
  @ApiProperty({
    type: String,
    description: '微信昵称',
  })
  nickName: string;

  @Expose()
  @ApiProperty({
    type: String,
    description: '微信头像',
  })
  avatarUrl: string;

  @Expose()
  @ApiProperty({
    type: String,
    description: '文章审核状态',
  })
  status: string;
}

/**
 * 包含了文章的点位DTO数据
 */
export class MapPointNotesDTO extends PageResponseDTO {
  constructor() {
    super();
  }

  @ApiProperty({
    type: [MapPointNoteInternalDTO],
    description:
      '点位信息列表，包括文章标题、图片和创作者头像和昵称。如果文章的创作者是自己则不显示头像和昵称',
  })
  points: MapPointNoteInternalDTO[];
}
