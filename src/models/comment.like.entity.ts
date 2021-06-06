import { DBNAME } from '@rehuo/common/constants/sql.constant';
import { BaseEntity, Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity(DBNAME.COMMENT_LIKES)
@Index(['userId', 'commentId'], { unique: true })
export class CommentLikeEntity extends BaseEntity {
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
    name: 'comment_id',
    comment: '评论ID号',
    unsigned: true,
  })
  commentId: number;
}
