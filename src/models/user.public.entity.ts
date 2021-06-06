import { DBNAME } from '@rehuo/common/constants/sql.constant';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity(DBNAME.USER_PUBLICS)
export class UserPublicEntity extends BaseEntity {
  @PrimaryGeneratedColumn({
    name: 'tp_id',
  })
  tpId: number;

  @CreateDateColumn({
    name: 'created_at',
    nullable: false,
  })
  createdAt: Date;

  @Column({
    name: 'provider_id',
    comment: '迁移发起者ID',
    unsigned: true,
  })
  providerId: number;

  @Column({
    comment: '城市编码',
    length: 6,
  })
  code: string;
}
