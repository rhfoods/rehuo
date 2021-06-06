import { ApiProperty } from '@nestjs/swagger';
import { UserClockFeels } from '@rehuo/common/constants/user.constant';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

/**
 * 用户打卡DTO
 */
export class UserClockDTO {
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @ApiProperty({
    type: Number,
    minimum: 1,
    description: '点位收藏ID',
  })
  readonly psaveId: number;

  @IsEnum(UserClockFeels)
  @IsNotEmpty()
  @ApiProperty({
    enum: UserClockFeels,
    type: String,
    description: '用户打卡体验',
  })
  readonly feel: UserClockFeels;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @IsOptional()
  @ApiProperty({
    type: Number,
    minimum: 1,
    required: false,
    description: '文章ID,如果没有对应的文章ID，则不填写',
  })
  readonly noteId: number;

  userId: number;
}
