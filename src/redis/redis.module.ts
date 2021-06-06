import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { RedisService } from './redis.service';

@Module({
  imports: [ConfigModule, JwtModule.register({})],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
