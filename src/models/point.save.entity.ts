import {
  MapPointFieldLengths,
  PointOwnTypes,
} from '@rehuo/common/constants/point.constant';
import { DBNAME } from '@rehuo/common/constants/sql.constant';
import { SystemConstants } from '@rehuo/common/constants/system.constant';
import { BooleanTransformer } from '@rehuo/common/transformers/bool.transformer';
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

@Entity(DBNAME.POINT_SAVES)
@Index(['userId', 'pointId'])
@Index(['userId', 'sortId'])
@Index(['topNoteId'])
@Index(['noteId'])
@Index(['fpsaveId', 'topNoteId'])
export class PointSaveEntity extends BaseEntity {
  @PrimaryGeneratedColumn({
    name: 'psave_id',
  })
  psaveId: number;

  @Column({
    name: 'ff_psave_id',
    comment: '最原始的点位收藏',
    unsigned: true,
    default: 0,
  })
  ffpsaveId: number;

  @Column({
    name: 'f_psave_id',
    comment: '表示是根据谁的psaveId进行收藏',
    unsigned: true,
    default: 0,
  })
  fpsaveId: number;

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
    length: SystemConstants.NORMAL_LENGTH,
    comment: '点位名称',
    charset: 'utf8mb4',
  })
  name: string;

  @Column({
    length: MapPointFieldLengths.TAG,
    comment: '点位展示标签',
    charset: 'utf8mb4',
  })
  tag: string;

  @Column({
    comment: '点位展示LOGO',
    length: SystemConstants.SMALL_LENGTH,
  })
  logo: string;

  @Column({
    name: 'is_passed',
    type: 'tinyint',
    default: false,
    unsigned: true,
    comment: '点位是否已经去过',
    transformer: new BooleanTransformer(),
  })
  isPassed: boolean;

  @Column({
    comment: '点位人均价',
    default: 0,
    unsigned: true,
  })
  price: number;

  @Column({
    name: 'user_id',
    comment: '创建者ID',
    unsigned: true,
    default: 0,
  })
  userId: number;

  @Column({
    name: 'point_id',
    comment: '点位ID',
    unsigned: true,
    default: 0,
  })
  pointId: number;

  @Column({
    name: 'sort_id',
    comment: '分类ID,为0则表示默认分类',
    unsigned: true,
    default: 0,
  })
  sortId: number;

  @Column({
    name: 'note_id',
    comment: '对应自己写的文章ID号',
    unsigned: true,
    default: 0,
  })
  noteId: number;

  @Column('enum', {
    name: 'own_type',
    enum: PointOwnTypes,
    comment: '点位收藏的所属类型',
    default: PointOwnTypes.MY_CREATE,
  })
  ownType: PointOwnTypes;

  @Column({
    name: 'top_note_id',
    comment: '置顶文章ID号',
    default: 0,
  })
  topNoteId: number;

  @Column({
    name: 'is_toped',
    type: 'tinyint',
    default: false,
    unsigned: true,
    comment: '是否置顶',
    transformer: new BooleanTransformer(),
  })
  isToped: boolean;
}
