import { Module } from '@nestjs/common';
import { SharedModule } from '@rehuo/shared/shared.module';
import { WeixinController } from './weixin.controller';
import { WeixinService } from './weixin.service';

@Module({
  controllers: [WeixinController],
  providers: [WeixinService],
  imports: [SharedModule],
})
export class WeixinModule {}
