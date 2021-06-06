import { DBNAME } from '@rehuo/common/constants/sql.constant';
import { SystemConstants } from '@rehuo/common/constants/system.constant';
import { PwdTransformer } from '@rehuo/common/transformers/pwd.transformer';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity(DBNAME.AUDITORS)
export class AuditorEntity extends BaseEntity {
  @PrimaryGeneratedColumn({
    name: 'auditor_id',
  })
  auditorId: number;

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
    length: SystemConstants.LITTLE_LENGTH,
    comment: '账号名称',
    unique: true,
  })
  account: string;

  @Column({
    comment: '登录密码',
    transformer: new PwdTransformer(),
  })
  password: string;

  @Column({
    length: SystemConstants.LITTLE_LENGTH,
    comment: '名称',
    default: '审核员',
    charset: 'utf8mb4',
  })
  name: string;
}
