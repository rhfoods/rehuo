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
import { MapSaveEntity } from '@rehuo/models/map.save.entity';
import { RedisModule } from '@rehuo/redis/redis.module';
import { UserModule } from '@rehuo/user/user.module';
import { PointSortModule } from '../point/modules/sort/point.sort.module';
import { MapSaveController } from './map.save.controller';
import { MapSaveService } from './map.save.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MapSaveEntity]),
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
    forwardRef(() => MessageModule),
    forwardRef(() => RedisModule),
    forwardRef(() => PointSortModule),
  ],
  controllers: [MapSaveController],
  providers: [MapSaveService],
  exports: [MapSaveService],
})
export class MapSaveModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(
      {
        path: 'map/save',
        method: RequestMethod.POST,
      },
      {
        path: 'map/save',
        method: RequestMethod.DELETE,
      },
      {
        path: 'map/saves',
        method: RequestMethod.GET,
      },
    );
  }
}
