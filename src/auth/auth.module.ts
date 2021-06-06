import {
  forwardRef,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuditorModule } from '@rehuo/auditor/auditor.module';
import redisConf from '@rehuo/configs/redis.config';
import { HintModule } from '@rehuo/hint/hint.module';
import { MessageModule } from '@rehuo/message/message.module';
import { RedisModule } from '@rehuo/redis/redis.module';
import { SharedModule } from '@rehuo/shared/shared.module';
import { UserModule } from '@rehuo/user/user.module';
import { AuthController } from './auth.controller';
import { AuthMiddleware } from './auth.middleware';
import { AuthService } from './auth.service';
import { AuthTokenService } from './passport/auth.token.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [redisConf],
    }),
    forwardRef(() => RedisModule),
    JwtModule.register({}),
    SharedModule,
    forwardRef(() => UserModule),
    forwardRef(() => HintModule),
    forwardRef(() => AuditorModule),
    forwardRef(() => MessageModule),
  ],
  providers: [AuthService, AuthTokenService],
  exports: [AuthTokenService],
  controllers: [AuthController],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(
      {
        path: 'auth/token',
        method: RequestMethod.POST,
      },
      {
        path: 'auth/sms',
        method: RequestMethod.POST,
      },
    );
  }
}
