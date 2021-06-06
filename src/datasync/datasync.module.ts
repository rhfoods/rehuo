import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HintUserEntity } from '@rehuo/models/hint.user.entity';
import { RedisModule } from '@rehuo/redis/redis.module';
import { DataSyncService } from './datasync.service';

@Module({
  imports: [TypeOrmModule.forFeature([HintUserEntity]), RedisModule],
  providers: [DataSyncService],
  exports: [DataSyncService],
})
export class DatasyncModule {}
