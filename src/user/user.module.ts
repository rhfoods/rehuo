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
import { UserEntity } from '@rehuo/models/user.entity';
import { UserStatEntity } from '@rehuo/models/user.stat.entity';
import { RedisModule } from '@rehuo/redis/redis.module';
import { UserClockModule } from './modules/userclock/user.clock.module';
import { UserService } from './services/user.service';
import { UserStatService } from './services/user.stat.service';
import { UserController } from './user.controller';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    TypeOrmModule.forFeature([UserEntity, UserStatEntity]),
    forwardRef(() => HintModule),
    forwardRef(() => UserClockModule),
    forwardRef(() => RedisModule),
  ],
  providers: [UserService, UserStatService],
  controllers: [UserController],
  exports: [UserService, UserStatService],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(
      {
        path: 'user',
        method: RequestMethod.PUT,
      },
      {
        path: 'user/clock',
        method: RequestMethod.POST,
      },
    );
  }
}
