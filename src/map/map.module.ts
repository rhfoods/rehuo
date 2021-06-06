import {
  forwardRef,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AuthMiddleware } from '@rehuo/auth/auth.middleware';
import { AuthModule } from '@rehuo/auth/auth.module';
import { RedisModule } from '@rehuo/redis/redis.module';
import { SharedModule } from '@rehuo/shared/shared.module';
import { UserClockModule } from '@rehuo/user/modules/userclock/user.clock.module';
import { UserModule } from '@rehuo/user/user.module';
import { MapController } from './map.controller';
import { PointNoteModule } from './modules/point/modules/note/point.note.module';
import { PointSortModule } from './modules/point/modules/sort/point.sort.module';
import { MapSaveModule } from './modules/save/map.save.module';
import { MapShareModule } from './modules/share/map.share.module';
import { MapCacheService } from './services/map.cache.service';
import { PublicMapService } from './services/public.map.service';
import { UserMapService } from './services/user.map.service';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => AuthModule),
    forwardRef(() => MapSaveModule),
    forwardRef(() => PointSortModule),
    forwardRef(() => UserClockModule),
    forwardRef(() => PointNoteModule),
    forwardRef(() => RedisModule),
    SharedModule,
    MapShareModule,
  ],
  providers: [UserMapService, PublicMapService, MapCacheService],
  exports: [UserMapService, PublicMapService, MapCacheService],
  controllers: [MapController],
})
export class MapModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(
      {
        path: 'map/wxcode',
        method: RequestMethod.POST,
      },
      {
        path: 'map',
        method: RequestMethod.GET,
      },
      {
        path: 'map/transfer',
        method: RequestMethod.POST,
      },
      {
        path: 'map/scope',
        method: RequestMethod.GET,
      },
      {
        path: 'map/transfer/public',
        method: RequestMethod.POST,
      },
      {
        path: 'map/city/point/profile',
        method: RequestMethod.GET,
      },
    );
  }
}
