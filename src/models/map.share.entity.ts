import { MapShareTypes } from '@rehuo/common/constants/point.constant';
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

@Entity(DBNAME.MAP_SHARES)
@Index(['userId', 'type', 'commonId'], { unique: true })
export class MapShareEntity extends BaseEntity {
  @PrimaryGeneratedColumn({
    name: 'share_id',
  })
  shareId: number;

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
    comment: '发起分享者ID',
    unsigned: true,
  })
  userId: number;

  @Column('enum', {
    enum: MapShareTypes,
    comment: '分享类型定义',
  })
  type: MapShareTypes;

  @Column({
    name: 'common_id',
    comment: '对应的ID，包括userId、pointId和noteId',
    unsigned: true,
  })
  commonId: number;

  @Column({
    comment: '分享次数',
    unsigned: true,
    default: 1,
  })
  counts: number;
}
