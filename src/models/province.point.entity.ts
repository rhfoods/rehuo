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

@Entity(DBNAME.PROVINCE_POINTS)
@Index(['userId', 'code'], { unique: true })
export class ProvincePointEntity extends BaseEntity {
  @PrimaryGeneratedColumn({
    name: 'pp_id',
  })
  ppId: number;

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
    comment: '创建者ID',
    unsigned: true,
  })
  userId: number;

  @Column({
    comment: '省直辖市编码',
    length: 2,
  })
  code: string;

  @Column({
    comment: '对应的点位数',
    unsigned: true,
    default: 0,
  })
  counts: number;
}
