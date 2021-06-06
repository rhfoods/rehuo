import { ApiProperty } from '@nestjs/swagger';
import { SmsSignTypes, SmsTemplateTypes } from '@rehuo/common/constants/sms.constant';
import { SystemConstants } from '@rehuo/common/constants/system.constant';
import {
  IsEnum,
  IsMobilePhone,
  IsNotEmpty,
  IsString,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';

/**
 * 获取短信请求DTO数据
 */
export class SmsGetDTO {
  @IsString()
  @IsNotEmpty()
  @IsMobilePhone('zh-CN')
  @MinLength(SystemConstants.PHONE_MIN_LENGTH)
  @MaxLength(SystemConstants.PHONE_MAX_LENGTH)
  @ApiProperty({
    type: String,
    minLength: SystemConstants.PHONE_MIN_LENGTH,
    maxLength: SystemConstants.PHONE_MAX_LENGTH,
    description: '接收短信的电话号码',
  })
  readonly phone: string;

  @IsEnum(SmsTemplateTypes)
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    enum: SmsTemplateTypes,
    description: '短信签名',
  })
  readonly template: SmsTemplateTypes;

  @IsEnum(SmsSignTypes)
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    enum: SmsSignTypes,
    description: '短信模板',
  })
  readonly sign: SmsSignTypes;

  userId: number;
}

/**
 * 验证短信DTO数据
 */
export class SmsVerifyDTO {
  @IsString()
  @IsMobilePhone('zh-CN')
  @MinLength(SystemConstants.PHONE_MIN_LENGTH)
  @MaxLength(SystemConstants.PHONE_MAX_LENGTH)
  @ApiProperty({
    type: String,
    minLength: SystemConstants.PHONE_MIN_LENGTH,
    maxLength: SystemConstants.PHONE_MAX_LENGTH,
    description: '接收短信的电话号码',
  })
  readonly phone: string;

  @IsString()
  @IsNotEmpty()
  @Length(SystemConstants.PWD_MIN_LENGTH)
  @ApiProperty({
    type: String,
    minLength: SystemConstants.PWD_MIN_LENGTH,
    maxLength: SystemConstants.PWD_MIN_LENGTH,
    description: '短信验证码',
  })
  readonly smsCode: string;
}
