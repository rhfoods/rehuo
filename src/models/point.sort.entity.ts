import { DBNAME } from '@rehuo/common/constants/sql.constant';
import { SystemConstants } from '@rehuo/common/constants/system.constant';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity(DBNAME.POINT_SORTS)
@Index(['sortId', 'userId'])
@Index(['userId', 'name', 'cityCode'], { unique: true })
export class PointSortEntity extends BaseEntity {
  @PrimaryGeneratedColumn({
    name: 'sort_id',
  })
  sortId: number;

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
    length: SystemConstants.LITTLE_LENGTH,
    comment: '分类名称',
    charset: 'utf8mb4',
  })
  name: string;

  @Column({
    name: 'user_id',
    comment: '创建者ID',
    unsigned: true,
  })
  userId: number;

  @Column({
    comment: '分类对应的点位数',
    unsigned: true,
    default: 0,
  })
  points: number;

  @Column({
    name: 'city_code',
    comment: '城市编码',
    length: 6,
    default: '',
  })
  cityCode: string;

  @Column({
    comment: '默认LOGO',
    length: SystemConstants.SMALL_LENGTH,
    default: '',
  })
  logo: string;
}
