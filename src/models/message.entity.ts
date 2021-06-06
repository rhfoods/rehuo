import { MessageQueryTypes } from '@rehuo/common/constants/message.constant';
import { DBNAME } from '@rehuo/common/constants/sql.constant';
import { BooleanTransformer } from '@rehuo/common/transformers/bool.transformer';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity(DBNAME.MESSAGES)
@Index(['msgId', 'type'])
export class MessageEntity extends BaseEntity {
  @PrimaryGeneratedColumn({
    name: 'msg_id',
  })
  msgId: number;

  @CreateDateColumn({
    name: 'created_at',
    nullable: false,
  })
  createdAt: Date;

  @Column({
    name: 'user_id',
    comment: '用户ID',
    unsigned: true,
    default: 0,
  })
  userId: number;

  @Column('enum', {
    enum: MessageQueryTypes,
    comment: '消息类型',
  })
  type: MessageQueryTypes;

  @Column({
    name: 'is_read',
    type: 'tinyint',
    default: false,
    unsigned: true,
    comment: '消息是否已经被阅读了，为true表示已读',
    transformer: new BooleanTransformer(),
  })
  isRead: boolean;

  @Column('simple-json', {
    comment: '消息内容',
  })
  content: object;
}
