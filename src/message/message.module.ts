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
import { HintModule } from '@rehuo/hint/hint.module';
import { PointNoteModule } from '@rehuo/map/modules/point/modules/note/point.note.module';
import { PointSaveModule } from '@rehuo/map/modules/point/modules/save/point.save.module';
import { PointSortModule } from '@rehuo/map/modules/point/modules/sort/point.sort.module';
import { MessageEntity } from '@rehuo/models/message.entity';
import { RedisModule } from '@rehuo/redis/redis.module';
import { UserModule } from '@rehuo/user/user.module';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MessageEntity]),
    forwardRef(() => AuthModule),
    forwardRef(() => HintModule),
    forwardRef(() => RedisModule),
    forwardRef(() => UserModule),
    forwardRef(() => PointSortModule),
    forwardRef(() => PointSaveModule),
    forwardRef(() => PointNoteModule),
  ],
  controllers: [MessageController],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(
      {
        path: 'message',
        method: RequestMethod.POST,
      },
      {
        path: 'message',
        method: RequestMethod.GET,
      },
      {
        path: 'message/news',
        method: RequestMethod.GET,
      },
    );
  }
}
