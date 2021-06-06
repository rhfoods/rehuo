import { ApiProperty } from '@nestjs/swagger';
import { GenderTypes } from '@rehuo/common/constants/system.constant';
import { BaseDTO } from '@rehuo/common/dtos/base.response.dto';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserCommonDTO {
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
    type: Number,
    description: '收藏的地图数量',
  })
  saveMaps: number;

  @Expose()
  @ApiProperty({
    type: Number,
    description: '收藏的点位数量',
  })
  savePoints: number;

  @Expose()
  @ApiProperty({
    type: Number,
    description: '创建的点位数量',
  })
  createPoints: number;

  @Expose()
  @ApiProperty({
    type: Number,
    description: '消息提示总次数',
  })
  hints: number;

  @Expose()
  @ApiProperty({
    type: Number,
    description: '收藏与置顶',
  })
  savetops: number;

  @Expose()
  @ApiProperty({
    type: Number,
    description: '文章被浏览次数',
  })
  noteViews: number;

  @Expose()
  @ApiProperty({
    type: Number,
    description: '文章被置顶次数',
  })
  noteTops: number;

  @Expose()
  @ApiProperty({
    type: Number,
    description: '文章被点赞次数',
  })
  noteLikes: number;
}

/**
 * 返回的USER信息
 */
@Exclude()
export class UserInternalDTO extends UserCommonDTO {
  @Expose()
  @ApiProperty({
    type: Number,
    description: '用户ID',
  })
  userId: number;

  @Expose()
  @ApiProperty({
    enum: GenderTypes,
    type: () => GenderTypes,
    description: '性别',
  })
  gender: GenderTypes;

  @Expose()
  @ApiProperty({
    type: String,
    description: '城市',
  })
  city: string;

  @Expose()
  @ApiProperty({
    type: String,
    description: '简介',
  })
  introduce: string;

  @Expose()
  @ApiProperty({
    type: Boolean,
    description: '是否是市场推广人员',
  })
  isMarketer: boolean;
}

/**
 * 用户DTO数据
 */
export class UserDTO extends BaseDTO {
  constructor() {
    super();
  }

  @ApiProperty({
    type: UserInternalDTO,
    description: '用户信息',
  })
  user: UserInternalDTO;
}
