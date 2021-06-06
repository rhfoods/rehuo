import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { RedisModule } from '@rehuo/redis/redis.module';
import { OssService } from './services/oss.service';
import { SmsService } from './services/sms.service';
import { TokenService } from './services/token.service';
import { WechatService } from './services/wechat.service';

const providers = [OssService, WechatService, TokenService, SmsService];

@Module({
  imports: [ConfigModule, JwtModule.register({}), forwardRef(() => RedisModule)],
  providers: providers,
  exports: providers,
})
export class SharedModule {}
