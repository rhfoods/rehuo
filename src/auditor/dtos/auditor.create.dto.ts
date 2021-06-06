import { ApiProperty } from '@nestjs/swagger';
import {
  IsAlphanumeric,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { SystemConstants } from 'src/common/constants/system.constant';

/**
 * 创建后台审核人员
 */
export class AuditorCreateDTO {
  @IsString()
  @IsAlphanumeric()
  @IsNotEmpty()
  @IsOptional()
  @MaxLength(SystemConstants.LITTLE_LENGTH)
  @ApiProperty({
    type: String,
    maxLength: SystemConstants.LITTLE_LENGTH,
    description: '注册的账号名称,字符与数字的组合,长度不超过16字',
  })
  readonly account: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(SystemConstants.PWD_MIN_LENGTH)
  @MaxLength(SystemConstants.PWD_MAX_LENGTH)
  @ApiProperty({
    type: String,
    minLength: SystemConstants.PWD_MIN_LENGTH,
    maxLength: SystemConstants.PWD_MAX_LENGTH,
    description: '初始登录密码，长度为6~12字节的字符串',
  })
  readonly password: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @MaxLength(SystemConstants.LITTLE_LENGTH)
  @ApiProperty({
    required: false,
    type: String,
    maxLength: SystemConstants.LITTLE_LENGTH,
    description: '名称',
  })
  readonly name: string;
}
