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

@Entity(DBNAME.COUNTRY_POINTS)
@Index(['userId', 'code'], { unique: true })
export class CountryPointEntity extends BaseEntity {
  @PrimaryGeneratedColumn({
    name: 'cp_id',
  })
  cpId: number;

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
    comment: '区县编码',
    length: 6,
  })
  code: string;

  @Column({
    comment: '对应的点位数',
    unsigned: true,
    default: 0,
  })
  counts: number;
}
