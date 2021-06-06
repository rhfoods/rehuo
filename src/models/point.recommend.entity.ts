import { DBNAME } from '@rehuo/common/constants/sql.constant';
import { BooleanTransformer } from '@rehuo/common/transformers/bool.transformer';
import { NullTransformer } from '@rehuo/common/transformers/null.transformer';
import { FloatTransformer } from '@rehuo/common/transformers/number.transformer';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity(DBNAME.POINT_RECOMMENDS)
export class PointRecommendEntity extends BaseEntity {
  @PrimaryGeneratedColumn({
    name: 'pr_id',
  })
  prId: number;

  @CreateDateColumn({
    name: 'created_at',
    nullable: false,
  })
  createdAt: Date;

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
    comment: '点位地址',
    charset: 'utf8mb4',
  })
  address: string;

  @Column({
    comment: '点位名称',
    charset: 'utf8mb4',
  })
  name: string;

  @Column({
    comment: '推荐理由',
    charset: 'utf8mb4',
    default: '',
  })
  reason: string;

  @Column({
    type: 'simple-array',
    comment: '推荐图片',
    default: null,
    transformer: new NullTransformer(),
  })
  medias: string[];

  @Column({
    name: 'is_passed',
    type: 'tinyint',
    default: false,
    unsigned: false,
    comment: '推荐是否审核通过',
    transformer: new BooleanTransformer(),
  })
  isPassed: boolean;

  @Column({
    name: 'is_audit',
    type: 'tinyint',
    default: false,
    unsigned: false,
    comment: '推荐是否已经审核',
    transformer: new BooleanTransformer(),
  })
  isAudit: boolean;

  @Column({
    name: 'to_user_id',
    comment: '被推荐者ID',
    unsigned: true,
    default: 0,
  })
  toUserId: number;

  @Column({
    name: 'audit_info',
    charset: 'utf8mb4',
    default: '',
    comment: '推荐是否审核通过的原因',
  })
  auditInfo: string;

  @Column({
    name: 'user_id',
    comment: '推荐者ID',
    unsigned: true,
    default: 0,
  })
  userId: number;
}
