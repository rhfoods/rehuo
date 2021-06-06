import { DBNAME } from '@rehuo/common/constants/sql.constant';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity(DBNAME.NOTE_SAVES)
@Index(['psaveId', 'noteId'], { unique: true })
@Index(['userId', 'noteId'], { unique: true })
@Index(['userId', 'psaveId', 'noteId'], { unique: true })
export class NoteSaveEntity extends BaseEntity {
  @PrimaryGeneratedColumn({
    name: 'ns_id',
  })
  nsId: number;

  @CreateDateColumn({
    name: 'created_at',
    nullable: false,
  })
  createdAt: Date;

  @Column({
    name: 'user_id',
    comment: '点赞者ID',
    unsigned: true,
  })
  userId: number;

  @Column({
    name: 'psave_id',
    comment: '点位收藏ID',
    unsigned: true,
  })
  psaveId: number;

  @Column({
    name: 'note_id',
    comment: '文章ID号',
    unsigned: true,
  })
  noteId: number;
}
