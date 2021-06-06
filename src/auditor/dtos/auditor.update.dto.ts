import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { SystemConstants } from 'src/common/constants/system.constant';

/**
 * 更新后台审核人员请求数据
 */
export class AuditorUpdateDTO {
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
  readonly nickName: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @MinLength(SystemConstants.PWD_MIN_LENGTH)
  @MaxLength(SystemConstants.PWD_MAX_LENGTH)
  @ApiProperty({
    required: false,
    type: String,
    minLength: SystemConstants.PWD_MIN_LENGTH,
    maxLength: SystemConstants.PWD_MAX_LENGTH,
    description: '登录密码，长度为6~12字节的字符串',
  })
  readonly password: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @MinLength(SystemConstants.PWD_MIN_LENGTH)
  @MaxLength(SystemConstants.PWD_MAX_LENGTH)
  @ApiProperty({
    required: false,
    type: String,
    minLength: SystemConstants.PWD_MIN_LENGTH,
    maxLength: SystemConstants.PWD_MAX_LENGTH,
    description: '重新输入登录密码，长度为6~12字节的字符串',
  })
  repeatPassword: string;
}
