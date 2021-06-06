import { ApiProperty } from '@nestjs/swagger';
import { AuditorLoginDTO } from '@rehuo/auditor/dtos/auditor.login.dto';
import { SystemRoleTypes } from '@rehuo/common/constants/system.constant';
import { WechatMiniTypes } from '@rehuo/common/constants/wechat.constant';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { WechatCodeDTO } from './wechat.register.dto';

export class AuthRequestDTO {
  @IsEnum(SystemRoleTypes)
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    enum: SystemRoleTypes,
    description: '登录人员类型',
  })
  readonly role: SystemRoleTypes;

  @IsEnum(WechatMiniTypes)
  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({
    type: String,
    enum: WechatMiniTypes,
    description: '登录程序类型',
    required: false,
  })
  readonly miniType: WechatMiniTypes;

  @IsObject()
  @IsNotEmpty()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => WechatCodeDTO)
  @ApiProperty({
    type: WechatCodeDTO,
    required: false,
    description: '用户的微信登录信息',
  })
  readonly wxCode: WechatCodeDTO;

  @IsObject()
  @IsNotEmpty()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => AuditorLoginDTO)
  @ApiProperty({
    type: AuditorLoginDTO,
    required: false,
    description: '审核员账号信息',
  })
  readonly auditor: AuditorLoginDTO;
}
