import {
  forwardRef,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthMiddleware } from '@rehuo/auth/auth.middleware';
import { AuthModule } from '@rehuo/auth/auth.module';
import { PointSaveEntity } from '@rehuo/models/point.save.entity';
import { PointSortEntity } from '@rehuo/models/point.sort.entity';
import { RedisModule } from '@rehuo/redis/redis.module';
import { UserModule } from '@rehuo/user/user.module';
import { MapPointModule } from '../../map.point.module';
import { PointSaveModule } from '../save/point.save.module';
import { PointSortController } from './point.sort.controller';
import { PointSortService } from './point.sort.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PointSortEntity, PointSaveEntity]),
    forwardRef(() => MapPointModule),
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
    forwardRef(() => RedisModule),
    forwardRef(() => PointSaveModule),
  ],
  controllers: [PointSortController],
  providers: [PointSortService],
  exports: [PointSortService],
})
export class PointSortModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(
      {
        path: 'map/point/sort',
        method: RequestMethod.POST,
      },
      {
        path: 'map/point/sort',
        method: RequestMethod.PUT,
      },
      {
        path: 'map/point/sort',
        method: RequestMethod.DELETE,
      },
    );
  }
}
