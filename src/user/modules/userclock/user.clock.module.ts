import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PointSaveModule } from '@rehuo/map/modules/point/modules/save/point.save.module';
import { MessageModule } from '@rehuo/message/message.module';
import { UserClockEntity } from '@rehuo/models/user.clock.entity';
import { RedisModule } from '@rehuo/redis/redis.module';
import { UserClockController } from './user.clock.controller';
import { UserClockService } from './user.clock.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserClockEntity]),
    forwardRef(() => PointSaveModule),
    forwardRef(() => RedisModule),
    forwardRef(() => MessageModule),
  ],
  providers: [UserClockService],
  exports: [UserClockService],
  controllers: [UserClockController],
})
export class UserClockModule {}
