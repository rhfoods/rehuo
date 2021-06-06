import { DBNAME } from '@rehuo/common/constants/sql.constant';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity(DBNAME.POINT_SAVE_STATS)
export class PointSaveStatEntity extends BaseEntity {
  @PrimaryGeneratedColumn({
    name: 'ss_id',
  })
  ssId: number;

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
    name: 'psave_id',
    comment: '对应点位收藏ID',
    unsigned: true,
    unique: true,
  })
  psaveId: number;

  @Column({
    comment: '点位收藏次数',
    unsigned: true,
    default: 0,
  })
  saves: number;

  @Column({
    comment: '点位打卡表扬次数',
    unsigned: true,
    default: 0,
  })
  goods: number;

  @Column({
    comment: '点位打卡批评次数',
    unsigned: true,
    default: 0,
  })
  bads: number;

  @Column({
    comment: '点位分享次数',
    unsigned: true,
    default: 0,
  })
  shares: number;
}
