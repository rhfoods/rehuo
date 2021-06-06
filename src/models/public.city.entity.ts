import { DBNAME } from '@rehuo/common/constants/sql.constant';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity(DBNAME.PUBLIC_CITYS)
@Index(['code'], { unique: true })
export class PublicCityEntity extends BaseEntity {
  @PrimaryGeneratedColumn({
    name: 'pc_id',
  })
  pcId: number;

  @CreateDateColumn({
    name: 'created_at',
    nullable: false,
  })
  createdAt: Date;

  @Column({
    comment: '城市编码',
    length: 6,
  })
  code: string;
}
