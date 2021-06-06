import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigNamespaces } from '@rehuo/common/constants/config.constant';
import { Connection } from 'typeorm';
import { AuditorModule } from './auditor/auditor.module';
import appConf from './configs/app.config';
import mysqlConf from './configs/db.config';
import jwtConf from './configs/jwt.config';
import ossConf from './configs/oss.config';
import smsConf from './configs/sms.config';
import { validationSchema } from './configs/validate.schema';
import wxConf from './configs/wechat.config';
import { DatasyncModule } from './datasync/datasync.module';
import { MapModule } from './map/map.module';
import { SharedModule } from './shared/shared.module';
import { SyslogModule } from './syslog/syslog.module';
import { InitService } from './system/master/init.service';
import { MasterService } from './system/master/master.service';
import { TaskService } from './system/master/task.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'config/system.env',
      validationSchema,
      load: [appConf, mysqlConf, ossConf, wxConf, jwtConf, smsConf],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return configService.get(ConfigNamespaces.SQL);
      },
      inject: [ConfigService],
    }),
    AuditorModule,
    SharedModule,
    SyslogModule,
    MapModule,
    DatasyncModule,
  ],
  providers: [MasterService, InitService, TaskService],
})
export class AppModule {
  constructor(private connection: Connection) {
    this.runMigrations();
  }

  public runMigrations = async () => {
    const migrationsPending = await this.connection.showMigrations();
    if (migrationsPending) {
      const migrations = await this.connection.runMigrations({ transaction: 'all' });
      migrations.forEach(migration => {
        Logger.log(`Migration ${migration.name} success`);
      });
    } else {
      Logger.log('No migrations pending');
    }
  };
}
