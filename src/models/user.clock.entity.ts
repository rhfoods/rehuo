import { DBNAME } from '@rehuo/common/constants/sql.constant';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity(DBNAME.USER_CLOCKS)
@Index(['userId', 'psaveId'], { unique: true })
@Index(['userId', 'pointId'], { unique: true })
export class UserClockEntity extends BaseEntity {
  @PrimaryGeneratedColumn({
    name: 'clock_id',
  })
  clockId: number;

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
    unsigned: true,
  })
  userId: number;

  @Column({
    name: 'point_id',
    comment: '点位ID',
    unsigned: true,
  })
  pointId: number;

  @Column({
    name: 'psave_id',
    comment: '点位收藏ID',
    unsigned: true,
  })
  psaveId: number;

  @Column({
    name: 'note_id',
    comment: '分类ID，为0表示没有文章',
    default: 0,
    unsigned: true,
  })
  noteId: number;

  @Column({
    comment: '打卡总次数',
    default: 0,
    unsigned: true,
  })
  counts: number;

  @Column({
    comment: '打卡好评次数',
    default: 0,
    unsigned: true,
  })
  goods: number;

  @Column({
    comment: '打卡差评次数',
    default: 0,
    unsigned: true,
  })
  bads: number;
}
