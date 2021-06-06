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
import { MapShareEntity } from '@rehuo/models/map.share.entity';
import { RedisModule } from '@rehuo/redis/redis.module';
import { PointNoteModule } from '../point/modules/note/point.note.module';
import { MapShareController } from './map.share.controller';
import { MapShareService } from './map.share.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MapShareEntity]),
    forwardRef(() => AuthModule),
    forwardRef(() => RedisModule),
    forwardRef(() => PointNoteModule),
  ],
  controllers: [MapShareController],
  providers: [MapShareService],
})
export class MapShareModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes({
      path: 'map/share',
      method: RequestMethod.POST,
    });
  }
}
