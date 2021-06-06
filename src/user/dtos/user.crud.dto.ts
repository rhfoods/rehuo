import { ApiProperty } from '@nestjs/swagger';
import { GenderTypes, SystemConstants } from '@rehuo/common/constants/system.constant';
import {
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  ValidateIf,
} from 'class-validator';

/**
 * 用户信息更新DTO
 */
export class UserUpdateDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(SystemConstants.LITTLE_LENGTH)
  @IsOptional()
  @ApiProperty({
    type: String,
    required: false,
    maxLength: SystemConstants.LITTLE_LENGTH,
    description: '微信昵称',
  })
  readonly nickName: string;

  @ValidateIf(e => e === '')
  @IsUrl()
  @IsOptional()
  @ApiProperty({
    required: false,
    type: String,
    description: '微信头像',
  })
  readonly avatarUrl: string;

  @IsEnum(GenderTypes)
  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({
    required: false,
    type: () => GenderTypes,
    enum: GenderTypes,
    description: '性别',
  })
  readonly gender: GenderTypes;

  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
    type: String,
    description: '城市',
  })
  readonly city: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
    type: String,
    description: '省份',
  })
  readonly province: string;

  @IsString()
  @IsOptional()
  @MaxLength(SystemConstants.NORMAL_LENGTH)
  @ApiProperty({
    required: false,
    maximum: SystemConstants.NORMAL_LENGTH,
    type: String,
    description: '个人简介',
  })
  readonly introduce: string;
}

/**
 * 获取用户信息DTO
 */
export class UserGetDTO {
  @IsNotEmpty()
  @IsNumberString()
  @ApiProperty({
    type: Number,
    minimum: 0,
    description: '请求的用户ID值',
  })
  userId: number;
}
