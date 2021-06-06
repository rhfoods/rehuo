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
import { MapPointEntity } from '@rehuo/models/map.point.entity';
import { RedisModule } from '@rehuo/redis/redis.module';
import { SharedModule } from '@rehuo/shared/shared.module';
import { UserModule } from '@rehuo/user/user.module';
import { MapPointController } from './map.point.controller';
import { PointNoteModule } from './modules/note/point.note.module';
import { PointRecommendModule } from './modules/recommend/point.recommend.module';
import { PointSaveModule } from './modules/save/point.save.module';
import { PointSortModule } from './modules/sort/point.sort.module';
import { MapPointService } from './services/map.point.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MapPointEntity]),
    forwardRef(() => PointNoteModule),
    forwardRef(() => PointSaveModule),
    forwardRef(() => PointSortModule),
    forwardRef(() => PointRecommendModule),
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
    forwardRef(() => RedisModule),
    forwardRef(() => SharedModule),
  ],
  controllers: [MapPointController],
  providers: [MapPointService],
  exports: [MapPointService],
})
export class MapPointModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(
      {
        path: 'map/point',
        method: RequestMethod.POST,
      },
      {
        path: 'map/point',
        method: RequestMethod.PUT,
      },
    );
  }
}
