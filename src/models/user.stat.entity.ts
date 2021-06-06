import { DBNAME } from '@rehuo/common/constants/sql.constant';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity(DBNAME.USER_STATS)
export class UserStatEntity extends BaseEntity {
  @PrimaryGeneratedColumn({
    name: 'us_id',
  })
  usId: number;

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
    name: 'user_id',
    comment: '用户ID',
    unique: true,
  })
  userId: number;

  @Column({
    name: 'note_views',
    comment: '文章被浏览总数',
    unsigned: true,
    default: 0,
  })
  noteViews: number;

  @Column({
    name: 'note_tops',
    comment: '文章置顶总数',
    unsigned: true,
    default: 0,
  })
  noteTops: number;

  @Column({
    name: 'note_likes',
    comment: '文章获赞总数',
    unsigned: true,
    default: 0,
  })
  noteLikes: number;

  @Column({
    name: 'map_shares',
    comment: '地图被分享的次数',
    unsigned: true,
    default: 0,
  })
  mapShares: number;
}
