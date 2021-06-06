import { ApiProperty } from '@nestjs/swagger';
import { MapAreaTypes } from '@rehuo/common/constants/map.constant';
import { SystemConstants } from '@rehuo/common/constants/system.constant';
import { WechatDataTypes } from '@rehuo/common/constants/wechat.constant';
import { PageRequestDTO } from '@rehuo/common/dtos/page.request.dto';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsLatitude,
  IsLatLong,
  IsLongitude,
  IsMobilePhone,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsObject,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

/**
 * 地图获取请求DTO
 */
export class MapGetDTO {
  /**
   * 右上角坐标
   */
  @IsNotEmpty()
  @IsLatLong()
  @IsOptional()
  @ApiProperty({
    type: String,
    description: '右上角坐标',
    required: false,
  })
  readonly rightCorner: string;

  /**
   * 左下角坐标
   */
  @IsNotEmpty()
  @IsLatLong()
  @IsOptional()
  @ApiProperty({
    type: String,
    description: '左下角坐标',
    required: false,
  })
  readonly leftBottom: string;

  /**
   * 分类ID
   */
  @IsNumberString()
  @IsNotEmpty()
  @ApiProperty({
    type: Number,
    description: '分类ID，不输入或者-1则为所有点位，为0为默认分类',
  })
  readonly sortId: number;

  @IsNotEmpty()
  @IsNumberString()
  @ApiProperty({
    type: Number,
    minimum: 1,
    description: '地图提供者的ID',
  })
  readonly createrId: number;

  userId: number;
}

/**
 * 地图获取请求DTO(新方式)
 */
export class MapGetScopeDTO {
  /**
   * 分类ID
   */
  @IsNumberString()
  @IsNotEmpty()
  @ApiProperty({
    type: Number,
    description: '分类ID，不输入或者-1则为所有点位，为0为默认分类',
  })
  readonly sortId: number;

  @IsNotEmpty()
  @IsNumberString()
  @ApiProperty({
    type: Number,
    minimum: 1,
    description: '地图提供者的ID',
  })
  readonly createrId: number;

  @IsNotEmpty()
  @IsNumberString()
  @ApiProperty({
    type: Number,
    minimum: 3,
    maximum: 20,
    description: '地图缩放比列',
  })
  readonly scale: number;

  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(8)
  @ApiProperty({
    type: String,
    minimum: 2,
    maximum: 8,
    description: '区域编码',
  })
  readonly code: string;

  userId: number;
}

/**
 * 小程序分享scene定义
 */
class QrCodeShareScene {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    type: Number,
    description: '不同类型的ID值，地图为userId，点位为psaveId, 文章为noteId',
  })
  readonly id: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    type: Number,
    description: `当分享地图commonId为sortId，-1表示全部点位，0表示默认点位，其它为对应分类。当分享文章或者点位时，userId为地图用户者id`,
  })
  readonly commonId: number;

  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({
    type: Number,
    required: false,
    description: `当分享文章或者点位时，为文章的noteId值`,
  })
  readonly topNoteId: number;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @MinLength(4)
  @MaxLength(6)
  @ApiProperty({
    type: String,
    minLength: 4,
    maxLength: 6,
    required: false,
    description: `城市对应的编码`,
  })
  readonly cityCode: string;
}

/**
 * 小程序迁移scene定义
 */
class QrCodeTransferScene {
  @IsMobilePhone('zh-CN')
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: '迁移对象的手机号码',
  })
  readonly phone: string;

  userId: number;
}

/**
 * 小程序码scene定义
 */
class QrCodeScene {
  @IsEnum(WechatDataTypes)
  @IsNotEmpty()
  @ApiProperty({
    enum: WechatDataTypes,
    type: String,
    description: '分享类型',
  })
  readonly type: WechatDataTypes;

  @IsObject()
  @IsOptional()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => QrCodeShareScene)
  @ApiProperty({
    type: QrCodeShareScene,
    required: false,
    description: '分享Scene对象数据',
  })
  readonly share: QrCodeShareScene;

  @IsObject()
  @IsOptional()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => QrCodeTransferScene)
  @ApiProperty({
    type: QrCodeTransferScene,
    required: false,
    description: '迁移Scene对象数据',
  })
  readonly transfer: QrCodeTransferScene;
}

/**
 * RGB定义
 */
class QrCodeRGB {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: '红色分量',
  })
  readonly r: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: '绿色分量',
  })
  readonly g: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: '蓝色分量',
  })
  readonly b: string;
}

/**
 * 小程序码数据DTO
 */
export class QrCodeCheckDTO {
  @IsString()
  @IsNotEmpty()
  @Length(28, 32)
  @ApiProperty({
    type: String,
    description: '小程序码数据',
  })
  readonly scene: string;
}

/**
 * 生成小程序DTO
 */
export class MapQrCodeCreateDTO {
  @IsObject()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => QrCodeScene)
  @ApiProperty({
    type: QrCodeScene,
    description: '生成小程序码的SCENE值',
  })
  readonly scene: QrCodeScene;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({
    type: String,
    required: false,
    description: '跳转主页',
  })
  readonly page: string;

  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({
    type: Number,
    required: false,
    description: '小程序码宽度',
  })
  readonly width: number;

  @IsBoolean()
  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({
    type: Boolean,
    required: false,
    description: '是否自动调色',
  })
  readonly autoColor: boolean;

  @IsObject()
  @IsNotEmpty()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => QrCodeRGB)
  @ApiProperty({
    type: QrCodeRGB,
    required: false,
    description: 'autoColor为false时生效，RGB颜色值',
  })
  readonly lineColor: QrCodeRGB;

  @IsBoolean()
  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({
    type: Boolean,
    required: false,
    description: '是否需要透明底色',
  })
  readonly isHyaline: boolean;
}

/**
 * 数据迁移DTO
 */
export class MapTransferDTO {
  @IsString()
  @IsMobilePhone('zh-CN')
  @MinLength(SystemConstants.PHONE_MIN_LENGTH)
  @MaxLength(SystemConstants.PHONE_MAX_LENGTH)
  @ApiProperty({
    type: String,
    minLength: SystemConstants.PHONE_MIN_LENGTH,
    maxLength: SystemConstants.PHONE_MAX_LENGTH,
    description: '接收短信的电话号码',
  })
  readonly phone: string;

  @IsString()
  @IsNotEmpty()
  @Length(SystemConstants.PWD_MIN_LENGTH)
  @ApiProperty({
    type: String,
    minLength: SystemConstants.PWD_MIN_LENGTH,
    maxLength: SystemConstants.PWD_MIN_LENGTH,
    description: '短信验证码',
  })
  readonly smsCode: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    type: Number,
    description: '迁移发起者的useId',
  })
  readonly providerId: number;

  userId: number;
}

/**
 * 公共地图数据迁移DTO
 */
export class PublicMapTransferDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: '迁移目的地城市名称',
  })
  readonly cityName: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    type: Number,
    description: '迁移发起者ID',
  })
  readonly providerId: number;

  userId: number;
}

/**
 * 地图获取请求DTO(根据区域)
 */
export class MapGetAreaDTO {
  /**
   * 分类ID
   */
  @IsNumberString()
  @IsNotEmpty()
  @ApiProperty({
    type: Number,
    description: '分类ID，不输入或者-1则为所有点位，为0为默认分类',
  })
  readonly sortId: number;

  @IsNotEmpty()
  @IsNumberString()
  @ApiProperty({
    type: Number,
    minimum: 1,
    description: '地图提供者的ID',
  })
  readonly createrId: number;

  @IsEnum(MapAreaTypes)
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    enum: MapAreaTypes,
    description: '地图显示区域类型',
  })
  readonly type: MapAreaTypes;

  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  @MaxLength(8)
  @ApiProperty({
    type: String,
    minimum: 4,
    maximum: 8,
    description: '区域编码',
  })
  readonly code: string;
}

/**
 * 根据城市分类获取点位信息
 */
export class CitySortPointsGetDTO {
  /**
   * 分类ID
   */
  @IsNumberString()
  @IsNotEmpty()
  @ApiProperty({
    type: Number,
    minimum: 1,
    description: '对应的城市分类ID',
  })
  readonly sortId: number;

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

/**
 * 获取公共地图点位详情信息
 */
export class CityPointDetailGetDTO {
  /**
   * 点位收藏ID
   */
  @IsNumberString()
  @IsNotEmpty()
  @ApiProperty({
    type: Number,
    minimum: 1,
    description: '点位收藏ID',
  })
  readonly psaveId: number;

  userId: number;
}

/**
 * 获取公共地图点位对应的日志列表
 */
export class CityPointNotesGetDTO extends PageRequestDTO {
  /**
   * 点位收藏ID
   */
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
 * 获取定位附近的点位
 */
export class CityPointsNearDTO {
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

  @IsNumberString()
  @IsLongitude()
  @IsNotEmpty()
  @ApiProperty({
    type: Number,
    description: '点位经度',
  })
  readonly longitude: number;

  @IsNumberString()
  @IsLatitude()
  @IsNotEmpty()
  @ApiProperty({
    type: Number,
    description: '点位纬度',
  })
  readonly latitude: number;
}
