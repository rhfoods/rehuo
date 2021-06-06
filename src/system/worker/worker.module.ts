import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigNamespaces } from '@rehuo/common/constants/config.constant';
import { validationSchema } from '@rehuo/configs/validate.schema';
import { HintModule } from '@rehuo/hint/hint.module';
import { MapModule } from '@rehuo/map/map.module';
import { MapPointModule } from '@rehuo/map/modules/point/map.point.module';
import { PointNoteModule } from '@rehuo/map/modules/point/modules/note/point.note.module';
import { PointRecommendModule } from '@rehuo/map/modules/point/modules/recommend/point.recommend.module';
import { PointSaveModule } from '@rehuo/map/modules/point/modules/save/point.save.module';
import { PointSortModule } from '@rehuo/map/modules/point/modules/sort/point.sort.module';
import { MapSaveModule } from '@rehuo/map/modules/save/map.save.module';
import { MediaModule } from '@rehuo/media/media.module';
import { MessageModule } from '@rehuo/message/message.module';
import { SyslogModule } from '@rehuo/syslog/syslog.module';
import { ThirdModule } from '@rehuo/third/third.module';
import { AuthModule } from '../../auth/auth.module';
import appConf from '../../configs/app.config';
import mysqlConf from '../../configs/db.config';
import jwtConf from '../../configs/jwt.config';
import ossConf from '../../configs/oss.config';
import smsConf from '../../configs/sms.config';
import wxConf from '../../configs/wechat.config';
import { WorkerService } from './worker.service';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'config/system.env',
      validationSchema: validationSchema,
      load: [appConf, mysqlConf, jwtConf, ossConf, wxConf, smsConf],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return configService.get(ConfigNamespaces.SQL);
      },
      inject: [ConfigService],
    }),
    AuthModule,
    SyslogModule,
    MapModule,
    MediaModule,
    MapSaveModule,
    MapPointModule,
    PointSaveModule,
    PointSortModule,
    PointNoteModule,
    PointRecommendModule,
    HintModule,
    MessageModule,
    ThirdModule,
  ],
  providers: [WorkerService],
})
export class WorkerModule {}
