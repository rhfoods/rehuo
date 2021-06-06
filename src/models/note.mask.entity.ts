import { DBNAME } from '@rehuo/common/constants/sql.constant';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity(DBNAME.NOTE_MASKS)
@Index(['userId', 'psaveId'])
@Index(['userId', 'psaveId', 'noteId'], { unique: true })
export class NoteMaskEntity extends BaseEntity {
  @PrimaryGeneratedColumn({
    name: 'nm_id',
  })
  nmId: number;

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
