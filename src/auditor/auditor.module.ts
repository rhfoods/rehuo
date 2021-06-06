import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditorEntity } from '@rehuo/models/auditor.entity';
import { AuditorService } from './auditor.service';

@Module({
  imports: [TypeOrmModule.forFeature([AuditorEntity])],
  providers: [AuditorService],
  exports: [AuditorService],
})
export class AuditorModule {}
