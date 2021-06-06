import { ApiProperty } from '@nestjs/swagger';
import { MapScopeTypes } from '@rehuo/common/constants/map.constant';
import { PointOwnTypes } from '@rehuo/common/constants/point.constant';
import { BaseDTO } from '@rehuo/common/dtos/base.response.dto';
import { PageResponseDTO } from '@rehuo/common/dtos/page.response.dto';
import { Exclude, Expose } from 'class-transformer';

/**
 * 返回简略的点位信息
 */
@Exclude()
export class MapPointInternalDTO {
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
    description: '打卡心动数量',
  })
  goods: number;

  @Expose()
  @ApiProperty({
    type: String,
    description: '点位收藏LOGO',
  })
  logo: string;

  @Expose()
  @ApiProperty({
    type: Boolean,
    description: '点位是否去过',
  })
  isPassed: boolean;

  @Expose()
  @ApiProperty({
    enum: PointOwnTypes,
    type: () => PointOwnTypes,
    description: '点位收藏所属类型',
  })
  ownType: PointOwnTypes;

  @Expose()
  @ApiProperty({
    type: Number,
    description: '对应的分类ID',
  })
  sortId: number;

  @Expose()
  @ApiProperty({
    type: String,
    description: '点位所属分类',
  })
  code: string;

  @Expose()
  @ApiProperty({
    type: Number,
    required: false,
    description: '对应的文章ID，为0则表示没有写',
  })
  noteId: number;

  @Expose()
  @ApiProperty({
    type: Number,
    required: false,
    description: '置顶的文章ID',
  })
  topNoteId: number;

  @Expose()
  @ApiProperty({
    type: Boolean,
    required: false,
    description: '是否置顶过文章',
  })
  isToped: boolean;
}

/**
 * 地图点位DTO数据
 */
export class MapPointsDTO extends BaseDTO {
  constructor() {
    super();
  }

  @ApiProperty({
    type: [MapPointInternalDTO],
    description: '点位信息列表',
  })
  points: MapPointInternalDTO[];

  @ApiProperty({
    type: Boolean,
    description: '如果用户非访问自己的地图，true表示已经收藏，false表示未收藏',
  })
  isSaved: boolean;

  @ApiProperty({
    type: Number,
    required: false,
    description: '当收藏了对应地图时，-1表示为整张地图，其它为对应分类',
  })
  sortId: boolean;

  @ApiProperty({
    type: Number,
    description: '点位总数',
  })
  totalPoints: number;
}

/**
 * 返回的小程序DTO
 */
export class MapQrCodeDTO extends BaseDTO {
  constructor() {
    super();
  }

  @ApiProperty({
    type: Object,
    description: '门店小程序码信息',
  })
  qrCode: Record<string, any>;
}

/**
 * 城市信息数据
 */
@Exclude()
export class CityInfoInternalDTO {
  @Expose()
  @ApiProperty({
    type: Number,
    description: '点位数量',
  })
  counts: number;

  @Expose()
  @ApiProperty({
    type: String,
    description: '省市区县名称',
  })
  name: string;

  @Expose()
  @ApiProperty({
    type: String,
    description: '省市区县名称的中心经纬度',
  })
  latlng: string;

  @Expose()
  @ApiProperty({
    type: String,
    description: '区域编码',
  })
  code: string;

  @Expose()
  @ApiProperty({
    type: Number,
    description: '城市对应的缩放经纬度',
  })
  scale: number;
}

/**
 * 地图点位DTO数据
 */
export class MapsDTO extends BaseDTO {
  constructor() {
    super();
  }

  @ApiProperty({
    enum: MapScopeTypes,
    type: String,
    description: '返回的地图区域类型',
  })
  type: MapScopeTypes;

  @ApiProperty({
    type: String,
    description: '地区编码',
  })
  code: string;

  @ApiProperty({
    type: Number,
    description: '地区缩放比列',
  })
  scale: number;

  @ApiProperty({
    type: [CityInfoInternalDTO],
    description: '地图信息列表',
    required: false,
  })
  maps: CityInfoInternalDTO[];

  @ApiProperty({
    type: [MapPointInternalDTO],
    description: '点位信息列表',
    required: false,
  })
  points: MapPointInternalDTO[];

  @ApiProperty({
    type: Boolean,
    description: '如果用户非访问自己的地图，true表示已经收藏，false表示未收藏',
  })
  isSaved: boolean;
}

/**
 * 公共地图城市DTO数据
 */
export class PublicCitysDTO extends BaseDTO {
  constructor() {
    super();
  }

  @ApiProperty({
    type: [CityInfoInternalDTO],
    description: '城市信息数据',
  })
  citys: CityInfoInternalDTO[];
}

/**
 * 返回的文章信息，包括文章创作者的信息
 */
@Exclude()
export class CityPointNoteInternalDTO {
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
    description: '文章图片或者视频，仅第一张',
  })
  medias: string[];

  @Expose()
  @ApiProperty({
    type: Date,
    description: '对应文章最近更新时间',
  })
  updatedAt: Date;

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
    description: '文章点赞次数',
  })
  likes: number;
}

/**
 * 公共地图点位文章DTO数据
 */
export class CityPointNotesDTO extends PageResponseDTO {
  constructor() {
    super();
  }

  @ApiProperty({
    type: [CityPointNoteInternalDTO],
    description: '公共地图点位对应的文章信息',
  })
  notes: CityPointNoteInternalDTO[];
}
