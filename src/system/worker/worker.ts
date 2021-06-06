import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { ConfigNamespaces } from '@rehuo/common/constants/config.constant';
import {
  PROJECT_NAME,
  SystemEnvironments,
  URL_PREFIX,
} from '@rehuo/common/constants/system.constant';
import { AllExceptionFilter } from '@rehuo/common/filters/all-exception.filter';
import { RequestUrlInterceptor } from '@rehuo/common/interceptors/request.interceptor';
import { MasterService } from '../master/master.service';
import { swaggerSetup } from './swagger.setup';
import { WorkerModule } from './worker.module';

/**
 * worker bootstrap入口函数
 */
async function bootstrap() {
  const id = Number(process.env.id);

  process.title = `${PROJECT_NAME}: worker process ${id}`;

  const app = await NestFactory.create(WorkerModule);

  const configService = app.get(ConfigService);
  const port = configService.get('app.port') + id;

  app.setGlobalPrefix(URL_PREFIX);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: true,
      forbidNonWhitelisted: true,
      validationError: {
        value: true,
      },
    }),
  );

  const env = configService.get('app.env');
  if (env === SystemEnvironments.DEV) {
    app.useGlobalInterceptors(new RequestUrlInterceptor());
  }

  app.useGlobalFilters(new AllExceptionFilter());

  //允许跨域
  app.enableCors({
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  //根据程序运行环境选择是否启动swagger
  if (
    [SystemEnvironments.DEV, SystemEnvironments.TESTING].includes(
      configService.get(ConfigNamespaces.APP).env,
    )
  ) {
    swaggerSetup(app);
  }

  Logger.log(
    'Start child process succeed, ' + process.title + ', port: ' + port,
    MasterService.name,
  );

  await app.listen(port);
}

bootstrap();
