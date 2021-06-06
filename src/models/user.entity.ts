import { DBNAME } from '@rehuo/common/constants/sql.constant';
import { GenderTypes, SystemConstants } from '@rehuo/common/constants/system.constant';
import { BooleanTransformer } from '@rehuo/common/transformers/bool.transformer';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity(DBNAME.USERS)
@Index(['wxCOpenId'])
@Index(['wxPOpenId'])
@Index(['wxUnionId'])
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn({
    name: 'user_id',
  })
  userId: number;

  @CreateDateColumn({
    name: 'created_at',
    nullable: false,
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    nullable: true,
  })
  updatedAt: Date;

  @Column({
    name: 'nickname',
    length: SystemConstants.LITTLE_LENGTH,
    comment: '微信昵称',
    default: '',
    charset: 'utf8mb4',
  })
  nickName: string;

  @Column({
    name: 'avatar_url',
    comment: '微信头像URL地址',
    default: '',
  })
  avatarUrl: string;

  @Column('enum', {
    enum: GenderTypes,
    comment: '性别',
    default: GenderTypes.NONE,
  })
  gender: GenderTypes;

  @Column({
    length: SystemConstants.LITTLE_LENGTH,
    comment: '城市',
    default: '',
    charset: 'utf8mb4',
  })
  city: string;

  @Column({
    comment: '省份',
    default: '',
    charset: 'utf8mb4',
  })
  province: string;

  @Column({
    length: SystemConstants.NORMAL_LENGTH,
    comment: '个人简介',
    default: '',
    charset: 'utf8mb4',
  })
  introduce: string;

  @Column({
    name: 'wx_openid',
    comment: '微信openID',
    length: SystemConstants.SMALL_LENGTH,
    unique: true,
  })
  wxOpenId: string;

  @Column({
    name: 'wx_unionid',
    comment: '微信unionID',
    length: SystemConstants.SMALL_LENGTH,
    default: '',
  })
  wxUnionId: string;

  @Column({
    name: 'wx_copenid',
    comment: '微信创作者openID',
    length: SystemConstants.SMALL_LENGTH,
    default: '',
  })
  wxCOpenId: string;

  @Column({
    name: 'wx_popenid',
    comment: '公众号openID',
    length: SystemConstants.SMALL_LENGTH,
    default: '',
  })
  wxPOpenId: string;

  @Column({
    name: 'save_maps',
    comment: '收藏的地图数量',
    unsigned: true,
    default: 0,
  })
  saveMaps: number;

  @Column({
    name: 'save_points',
    comment: '收藏的点位数量',
    unsigned: true,
    default: 0,
  })
  savePoints: number;

  @Column({
    name: 'create_points',
    comment: '创建的点位数量',
    unsigned: true,
    default: 0,
  })
  createPoints: number;

  @Column({
    name: 'default_css',
    comment: '没有分类的点位数，包括自己创建和收藏的',
    unsigned: true,
    default: 0,
  })
  defaultCss: number;

  @Column({
    name: 'is_notified',
    type: 'tinyint',
    default: false,
    comment: '是否通知过对方',
    transformer: new BooleanTransformer(),
  })
  isNotified: boolean;
}
