import { DBNAME } from '@rehuo/common/constants/sql.constant';
import { SystemConstants } from '@rehuo/common/constants/system.constant';
import { FloatTransformer } from '@rehuo/common/transformers/number.transformer';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity(DBNAME.MAP_POINTS)
@Index(['latitude'])
@Index(['longitude'])
@Index(['address'])
@Index(['pointId', 'code'])
@Index(['latitude', 'longitude'], { unique: true })
@Index(['latitude', 'longitude', 'name', 'address'], { unique: true })
export class MapPointEntity extends BaseEntity {
  @PrimaryGeneratedColumn({
    name: 'point_id',
  })
  pointId: number;

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
    type: 'decimal',
    precision: 10,
    scale: 5,
    comment: '点位经度',
    transformer: new FloatTransformer(),
  })
  longitude: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 5,
    comment: '点位纬度',
    transformer: new FloatTransformer(),
  })
  latitude: number;

  @Column({
    length: SystemConstants.NORMAL_LENGTH,
    comment: '点位名称',
    charset: 'utf8mb4',
    default: '',
  })
  name: string;

  @Column({
    comment: '点位地址',
  })
  address: string;

  @Column({
    comment: '点位所属地区编码',
    length: 6,
    default: '',
  })
  code: string;
}
