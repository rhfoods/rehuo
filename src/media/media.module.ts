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
import { MediaController } from './media.controller';
import { MediaService } from './services/media.service';

@Module({
  imports: [SharedModule, forwardRef(() => AuthModule), forwardRef(() => RedisModule)],
  controllers: [MediaController],
  providers: [MediaService],
})
export class MediaModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(
      {
        path: 'media',
        method: RequestMethod.POST,
      },
      {
        path: 'media',
        method: RequestMethod.DELETE,
      },
    );
  }
}
