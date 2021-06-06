import { DBNAME } from '@rehuo/common/constants/sql.constant';
import { BaseEntity, Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity(DBNAME.NOTE_LIKES)
@Index(['userId', 'noteId'], { unique: true })
export class NoteLikeEntity extends BaseEntity {
  @PrimaryGeneratedColumn({
    name: 'nl_id',
  })
  nlId: number;

  @Column({
    name: 'user_id',
    comment: '点赞者ID',
    unsigned: true,
  })
  userId: number;

  @Column({
    name: 'note_id',
    comment: '文章ID号',
    unsigned: true,
  })
  noteId: number;
}
