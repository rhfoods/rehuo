import { DBNAME } from '@rehuo/common/constants/sql.constant';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity(DBNAME.HINT_USERS)
export class HintUserEntity extends BaseEntity {
  @PrimaryGeneratedColumn({
    name: 'uhint_id',
  })
  uhintId: number;

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
    default: 0,
    unique: true,
  })
  userId: number;

  @Column({
    comment: '收藏置顶消息次数',
    unsigned: true,
    default: 0,
  })
  savetops: number;

  @Column({
    comment: '打卡消息次数',
    unsigned: true,
    default: 0,
  })
  clocks: number;

  @Column({
    comment: '点赞消息次数',
    unsigned: true,
    default: 0,
  })
  likes: number;

  @Column({
    comment: '评论消息次数',
    unsigned: true,
    default: 0,
  })
  comments: number;

  @Column({
    comment: '系统消息次数',
    unsigned: true,
    default: 0,
  })
  systems: number;
}
