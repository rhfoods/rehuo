import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DBService } from '@rehuo/common/db/db.service';
import { ISyslog } from '@rehuo/common/interfaces/syslog.interface';
import { SyslogEntity } from '@rehuo/models/syslog.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SyslogService extends DBService<SyslogEntity> {
  constructor(
    @InjectRepository(SyslogEntity)
    private logRepo: Repository<SyslogEntity>,
  ) {
    super(logRepo, SyslogService.name);
  }

  /**
   * 插入一条日志
   */
  async createOne(log: ISyslog): Promise<any> {
    const entity = new SyslogEntity();
    entity.content = log;

    this.create(entity);
  }
}
