import { DBNAME } from '@rehuo/common/constants/sql.constant';
import { BaseEntity, Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity(DBNAME.USER_LINKS)
@Index(['userId', 'followerId'])
export class UserLinkEntity extends BaseEntity {
  @PrimaryGeneratedColumn({
    name: 'ul_id',
  })
  ulId: number;

  @Column({
    name: 'user_id',
    comment: '关注者ID',
  })
  userId: number;

  @Column({
    name: 'follower_id',
    comment: '被关注者ID',
  })
  followerId: number;
}
