import { Module } from '@nestjs/common';
import { WeixinModule } from './wechat/weixin.module';

@Module({
  imports: [WeixinModule],
})
export class ThirdModule {}
