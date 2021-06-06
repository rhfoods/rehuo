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
import { MessageModule } from '@rehuo/message/message.module';
import { PointRecommendEntity } from '@rehuo/models/point.recommend.entity';
import { RedisModule } from '@rehuo/redis/redis.module';
import { UserModule } from '@rehuo/user/user.module';
import { PointRecommendController } from './point.recommend.controller';
import { PointRecommendService } from './point.recommend.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PointRecommendEntity]),
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
    forwardRef(() => RedisModule),
    forwardRef(() => MessageModule),
  ],
  controllers: [PointRecommendController],
  providers: [PointRecommendService],
  exports: [PointRecommendService],
})
export class PointRecommendModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(
      {
        path: 'map/point/recommend',
        method: RequestMethod.POST,
      },
      {
        path: 'map/point/recommends',
        method: RequestMethod.GET,
      },
      {
        path: 'map/point/recommend',
        method: RequestMethod.PUT,
      },
    );
  }
}
