import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { InitService } from './system/master/init.service';

declare const module: any;

/**
 * 系统运行初始化配置
 */
async function init(app: INestApplication) {
  const initService = app.get(InitService);

  //获取微信服务TOKEN
  await initService.wxToken();

  //获取ALIOSS STS
  await initService.aliSTS();

  //创建默认审核员
  await initService.auditor();

  //上传客服图片到微信服务器
  await initService.tempMedia();
}

/**
 * 系统bootstrap入口函数
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  init(app);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
