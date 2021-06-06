import { DBNAME } from '@rehuo/common/constants/sql.constant';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity(DBNAME.USER_RECOMMENDS)
export class UserRecommendEntity extends BaseEntity {
  @PrimaryGeneratedColumn({
    name: 'rp_id',
  })
  rpId: number;

  @CreateDateColumn({
    name: 'created_at',
    nullable: false,
  })
  createdAt: Date;

  @Column({
    name: 'note_id',
    comment: '推荐的文章ID',
    unsigned: true,
    default: 0,
  })
  noteId: number;

  @Column({
    name: 'psave_id',
    comment: '推荐的点位收藏ID',
    unsigned: true,
    default: 0,
  })
  psaveId: number;
}
