import {
  NoteCommentTypes,
  NOTE_COMMENT_MAX,
} from '@rehuo/common/constants/note.constant';
import { DBNAME } from '@rehuo/common/constants/sql.constant';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity(DBNAME.NOTE_COMMENTS)
@Index(['commentId', 'noteId', 'userId'])
@Index(['noteId', 'type'])
@Index(['fatherId', 'type'])
@Index(['fatherId'])
export class NoteCommentEntity extends BaseEntity {
  @PrimaryGeneratedColumn({
    name: 'comment_id',
  })
  commentId: number;

  @CreateDateColumn({
    name: 'created_at',
    nullable: false,
  })
  createdAt: Date;

  @Column({
    name: 'user_id',
    comment: '评论者ID',
    unsigned: true,
  })
  userId: number;

  @Column({
    name: 'note_id',
    comment: '文章ID号',
    unsigned: true,
  })
  noteId: number;

  @Column({
    name: 'father_id',
    comment: '评论的父ID',
    unsigned: true,
    default: 0,
  })
  fatherId: number;

  @Column({
    name: 'up_id',
    comment: '评论的上一级ID',
    unsigned: true,
    default: 0,
  })
  upId: number;

  @Column('enum', {
    enum: NoteCommentTypes,
    comment: '评论的类型',
    default: NoteCommentTypes.QUESTION,
  })
  type: NoteCommentTypes;

  @Column({
    comment: '评论内容',
    length: NOTE_COMMENT_MAX,
    charset: 'utf8mb4',
  })
  comment: string;

  @Column({
    comment: '点赞',
    unsigned: true,
    default: 0,
  })
  likes: number;

  @Column({
    name: 'a_counts',
    comment: '子评论数',
    unsigned: true,
    default: 0,
  })
  aCounts: number;
}
