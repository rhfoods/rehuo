import { ApiProperty } from '@nestjs/swagger';
import { BaseDTO } from '@rehuo/common/dtos/base.response.dto';
import { PageResponseDTO } from '@rehuo/common/dtos/page.response.dto';
import { Exclude, Expose, Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { MapPointSaveInternalDTO } from '../../../dtos/map.point.dto';

/**
 * 文章信息
 */
@Exclude()
export class PointNoteInternalDTO {
  @Expose()
  @ApiProperty({
    type: Number,
    description: '文章ID',
  })
  noteId: number;

  @Expose()
  @ApiProperty({
    type: Date,
    description: '对应文章最近更新时间',
  })
  updatedAt: Date;

  @Expose()
  @ApiProperty({
    type: String,
    description: '文章标题',
  })
  title: string;

  @Expose()
  @ApiProperty({
    type: String,
    description: '文章内容',
  })
  content: string;

  @Expose()
  @ValidateNested({ each: true })
  @Type(() => String)
  @ApiProperty({
    type: [String],
    description: '文章图片或者视频',
  })
  medias: string[];

  @Expose()
  @ValidateNested({ each: true })
  @Type(() => String)
  @ApiProperty({
    type: [String],
    description: '场景描述',
  })
  scenes: string[];

  @Expose()
  @ApiProperty({
    type: String,
    description: 'B站链接',
  })
  blLink: string;

  @Expose()
  @ApiProperty({
    type: String,
    description: '微博链接',
  })
  wbLink: string;

  @Expose()
  @ApiProperty({
    type: String,
    description: '小红书链接',
  })
  xhsLink: string;

  @Expose()
  @ApiProperty({
    type: Number,
    description: '文章创造者ID',
  })
  userId: number;

  @Expose()
  @ApiProperty({
    type: String,
    description: '对应文章创作者的头像',
  })
  avatarUrl: string;

  @Expose()
  @ApiProperty({
    type: String,
    description: '对应文章创作者的昵称',
  })
  nickName: string;

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
    description: '文章被分享次数',
  })
  shares: number;

  @Expose()
  @ApiProperty({
    type: Number,
    description: '文章对应的评论条数',
  })
  comments: number;

  @Expose()
  @ApiProperty({
    type: Number,
    description: '文章点赞次数',
  })
  likes: number;

  @Expose()
  @ApiProperty({
    type: Boolean,
    description: 'true为已点赞，false为取消点赞',
  })
  isLiked: boolean;

  @Expose()
  @ApiProperty({
    type: Boolean,
    description:
      'true为已收藏，false为未收藏。本字段仅别人地图上的点位和别人发的链接才有效',
  })
  isSaved: boolean;

  @Expose()
  @ApiProperty({
    type: Boolean,
    description: '该文章是否是自己的，true为自己的',
  })
  isMy: boolean;

  @Expose()
  @ApiProperty({
    type: String,
    description: '点位收藏标签',
  })
  tag: string;

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
    required: false,
    description: '针对公共地图写发现，返回对应的psaveId',
  })
  newPsaveId: number;
}

/**
 * 文章DTO数据
 */
export class PointNoteDTO extends BaseDTO {
  constructor() {
    super();
  }

  @ApiProperty({
    type: PointNoteInternalDTO,
    description: '文章信息',
  })
  note: PointNoteInternalDTO;
}

/**
 * 返回的文章信息，包括文章创作者的信息
 */
@Exclude()
export class PointNoteUserInternalDTO {
  @Expose()
  @ApiProperty({
    type: Number,
    description: '点位收藏ID',
  })
  psaveId: number;

  @Expose()
  @ApiProperty({
    type: Number,
    description: '文章ID',
  })
  noteId: number;

  @Expose()
  @ApiProperty({
    type: String,
    description: '文章标题',
  })
  title: string;

  @Expose()
  @ApiProperty({
    type: [String],
    description: '文章图片或者视频，仅前面三张',
  })
  medias: string[];

  @Expose()
  @ApiProperty({
    type: String,
    description: '文章内容，仅前面95个字',
  })
  content: string;

  @Expose()
  @ApiProperty({
    type: Date,
    description: '对应文章最近更新时间',
  })
  updatedAt: Date;

  @Expose()
  @ApiProperty({
    type: String,
    description: '对应的收藏TAG',
  })
  tag: string;

  @Expose()
  @ApiProperty({
    type: String,
    description: '对应的收藏logo',
  })
  logo: string;

  @Expose()
  @ApiProperty({
    type: Number,
    description: '对应的收藏价格',
  })
  price: number;

  @Expose()
  @ApiProperty({
    type: String,
    description: '对应文章创作者的ID',
  })
  userId: string;

  @Expose()
  @ApiProperty({
    type: String,
    description: '对应文章创作者的头像',
  })
  avatarUrl: string;

  @Expose()
  @ApiProperty({
    type: String,
    description: '对应文章创作者的昵称',
  })
  nickName: string;

  @Expose()
  @ApiProperty({
    type: Number,
    description: '文章浏览次数',
  })
  views: number;

  @Expose()
  @ApiProperty({
    type: String,
    description: '文章被置顶次数',
  })
  tops: string;
}

/**
 * 文章列表DTO数据
 */
export class PointNoteUsersDTO extends PageResponseDTO {
  constructor() {
    super();
  }

  @ApiProperty({
    type: [PointNoteUserInternalDTO],
    description: '文章信息列表，包括文章创作者的信息',
  })
  notes: PointNoteUserInternalDTO[];
}

/**
 * 返回的文章收藏信息
 */
@Exclude()
export class PointNoteSaveInternalDTO {
  @Expose()
  @ApiProperty({
    type: Number,
    description: '文章ID',
  })
  noteId: number;
}

/**
 * 文章收藏DTO数据
 */
export class PointNoteSavedDTO extends BaseDTO {
  constructor() {
    super();
  }

  @ApiProperty({
    type: MapPointSaveInternalDTO,
    description: '点位信息。如果为null则表示已经存在对应点位，不然则返回新创建的点位收藏',
  })
  point: MapPointSaveInternalDTO;
}
