import { MapPointFieldLengths } from '@rehuo/common/constants/point.constant';
import { DBNAME } from '@rehuo/common/constants/sql.constant';
import { BooleanTransformer } from '@rehuo/common/transformers/bool.transformer';
import { NullTransformer } from '@rehuo/common/transformers/null.transformer';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity(DBNAME.POINT_NOTES)
@Index(['userId', 'psaveId', 'deletedAt'], { unique: true })
export class PointNoteEntity extends BaseEntity {
  @PrimaryGeneratedColumn({
    name: 'note_id',
  })
  noteId: number;

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

  @DeleteDateColumn({
    name: 'deleted_at',
    nullable: true,
  })
  deletedAt: Date;

  @Column({
    comment: '文章标题',
    length: MapPointFieldLengths.NOTE_TITLE,
    charset: 'utf8mb4',
  })
  title: string;

  @Column({
    comment: '文章内容',
    length: MapPointFieldLengths.NOTE_CONTENT,
    charset: 'utf8mb4',
    default: '',
  })
  content: string;

  @Column({
    type: 'simple-array',
    comment: '文章图片或者视频',
    default: null,
    transformer: new NullTransformer(),
  })
  medias: string[];

  @Column({
    type: 'simple-array',
    comment: '适用场景',
    default: null,
    transformer: new NullTransformer(),
  })
  scenes: string[];

  @Column({
    name: 'bl_link',
    comment: 'B站外部链接',
    default: '',
  })
  blLink: string;

  @Column({
    name: 'wb_link',
    comment: '微博外部链接',
    default: '',
  })
  wbLink: string;

  @Column({
    name: 'xhs_link',
    comment: '小红书外部链接',
    default: '',
  })
  xhsLink: string;

  @Column({
    comment: '文章浏览次数',
    unsigned: true,
    default: 0,
  })
  views: number;

  @Column({
    comment: '通过文章收藏点位的次数',
    unsigned: true,
    default: 0,
  })
  saves: number;

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
    name: 'psave_id',
    comment: '点位收藏ID',
    unsigned: true,
    default: 0,
  })
  psaveId: number;

  @Column({
    name: 'user_id',
    comment: '作者ID',
    unsigned: true,
    default: 0,
  })
  userId: number;

  @Column({
    name: 'is_audit',
    type: 'tinyint',
    default: false,
    unsigned: true,
    comment: '文章是否被审查',
    transformer: new BooleanTransformer(),
  })
  isAudit: boolean;
}
