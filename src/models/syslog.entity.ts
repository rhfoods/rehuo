import { ISyslog } from '@rehuo/common/interfaces/syslog.interface';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('syslogs')
export class SyslogEntity extends BaseEntity {
  @PrimaryGeneratedColumn({
    name: 'log_id',
  })
  logId: number;

  @CreateDateColumn({ name: 'created_at', nullable: false })
  createdAt: Date;

  @Column({
    type: 'simple-json',
    comment: '系统运行日志',
  })
  content: ISyslog;
}
