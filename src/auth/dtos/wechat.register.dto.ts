import { ApiProperty } from '@nestjs/swagger';
import { SystemConstants } from '@rehuo/common/constants/system.constant';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';

/**
 * 微信注册DTO
 */
export class WechatCodeDTO {
  @IsString()
  @IsNotEmpty()
  @Length(SystemConstants.SMALL_LENGTH)
  @ApiProperty({
    type: String,
    maxLength: SystemConstants.SMALL_LENGTH,
    minLength: SystemConstants.SMALL_LENGTH,
    description: '微信登录CODE码',
  })
  readonly code: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @MaxLength(SystemConstants.LITTLE_LENGTH)
  @ApiProperty({
    type: String,
    required: false,
    maxLength: SystemConstants.LITTLE_LENGTH,
    description: '微信昵称',
  })
  readonly nickName: string;

  @IsUrl()
  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({
    type: String,
    required: false,
    description: '微信头像',
  })
  readonly avatarUrl: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @MinLength(SystemConstants.SMALL_LENGTH)
  @ApiProperty({
    type: String,
    required: false,
    minLength: SystemConstants.NORMAL_LENGTH,
    description: '微信加密数据',
  })
  readonly encryptedData: string;

  @IsString()
  @IsNotEmpty()
  @Length(24)
  @IsOptional()
  @ApiProperty({
    type: String,
    minLength: 24,
    maxLength: 24,
    required: false,
    description: '微信加密IV值',
  })
  readonly iv: string;
}
