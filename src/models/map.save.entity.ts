import { DBNAME } from '@rehuo/common/constants/sql.constant';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity(DBNAME.MAP_SAVES)
@Index(['userId', 'createrId', 'sortId'], { unique: true })
export class MapSaveEntity extends BaseEntity {
  @PrimaryGeneratedColumn({
    name: 'msave_id',
  })
  msaveId: number;

  @CreateDateColumn({
    name: 'created_at',
    nullable: false,
  })
  createdAt: Date;

  @Column({
    name: 'creater_id',
    comment: '地图创建者ID',
    unsigned: true,
  })
  createrId: number;

  @Column({
    name: 'sort_id',
    comment: '点位分类ID，0表示默认分类,为-1表示所有点位',
    default: -1,
  })
  sortId: number;

  @Column({
    name: 'user_id',
    comment: '地图收藏者ID',
    unsigned: true,
  })
  userId: number;
}
