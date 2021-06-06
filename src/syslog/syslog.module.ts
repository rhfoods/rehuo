import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SyslogEntity } from '@rehuo/models/syslog.entity';
import { SyslogService } from './syslog.service';

@Module({
  imports: [TypeOrmModule.forFeature([SyslogEntity])],
  providers: [SyslogService],
  exports: [SyslogService],
})
export class SyslogModule {}
