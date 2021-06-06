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
import { HintUserEntity } from '@rehuo/models/hint.user.entity';
import { RedisModule } from '@rehuo/redis/redis.module';
import { HintController } from './hint.controller';
import { HintService } from './hint.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([HintUserEntity]),
    forwardRef(() => AuthModule),
    RedisModule,
  ],
  controllers: [HintController],
  providers: [HintService],
  exports: [HintService],
})
export class HintModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(
      {
        path: 'hint',
        method: RequestMethod.GET,
      },
      {
        path: 'hint',
        method: RequestMethod.POST,
      },
    );
  }
}
