import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { SystemConstants } from 'src/common/constants/system.constant';

export class AuditorLoginDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(SystemConstants.LITTLE_LENGTH)
  @ApiProperty({
    type: String,
    maxLength: SystemConstants.LITTLE_LENGTH,
    description: '审核员账号',
  })
  readonly account: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(SystemConstants.LITTLE_LENGTH)
  @ApiProperty({
    type: String,
    maxLength: SystemConstants.LITTLE_LENGTH,
    description: '审核员登录密码，长度为6~12字节的字符串',
  })
  readonly password: string;
}
