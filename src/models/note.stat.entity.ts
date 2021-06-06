import { DBNAME } from '@rehuo/common/constants/sql.constant';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity(DBNAME.NOTE_STATS)
export class NoteStatEntity extends BaseEntity {
  @PrimaryGeneratedColumn({
    name: 'ns_id',
  })
  nsId: number;

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
    name: 'note_id',
    comment: '文章ID号',
    unsigned: true,
    unique: true,
  })
  noteId: number;

  @Column({
    comment: '文章分享次数',
    unsigned: true,
    default: 0,
  })
  shares: number;

  @Column({
    comment: '文章浏览次数',
    unsigned: true,
    default: 0,
  })
  views: number;

  @Column({
    comment: '文章置顶次数',
    unsigned: true,
    default: 0,
  })
  tops: number;

  @Column({
    comment: '文章评论数',
    unsigned: true,
    default: 0,
  })
  comments: number;

  @Column({
    comment: '文章点赞次数',
    unsigned: true,
    default: 0,
  })
  likes: number;
}
