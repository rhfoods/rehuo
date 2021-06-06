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
import { PointSaveEntity } from '@rehuo/models/point.save.entity';
import { RedisModule } from '@rehuo/redis/redis.module';
import { UserClockModule } from '@rehuo/user/modules/userclock/user.clock.module';
import { UserModule } from '@rehuo/user/user.module';
import { MapPointModule } from '../../map.point.module';
import { PointNoteModule } from '../note/point.note.module';
import { PointSortModule } from '../sort/point.sort.module';
import { PointSaveController } from './point.save.controller';
import { PointSaveService } from './point.save.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PointSaveEntity]),
    forwardRef(() => AuthModule),
    forwardRef(() => PointNoteModule),
    forwardRef(() => MapPointModule),
    forwardRef(() => MessageModule),
    forwardRef(() => UserModule),
    forwardRef(() => PointSortModule),
    forwardRef(() => UserClockModule),
    forwardRef(() => RedisModule),
    forwardRef(() => MessageModule),
  ],
  controllers: [PointSaveController],
  providers: [PointSaveService],
  exports: [PointSaveService],
})
export class PointSaveModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(
      {
        path: 'map/point/save',
        method: RequestMethod.POST,
      },
      {
        path: 'map/point/save',
        method: RequestMethod.PUT,
      },
      {
        path: 'map/point/save',
        method: RequestMethod.DELETE,
      },
      {
        path: 'map/point/savetop',
        method: RequestMethod.PUT,
      },
      {
        path: 'map/point/save',
        method: RequestMethod.GET,
      },
      {
        path: 'map/point/mys',
        method: RequestMethod.GET,
      },
      {
        path: 'map/point/saves',
        method: RequestMethod.GET,
      },
    );
  }
}
