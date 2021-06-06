import { ApiProperty } from '@nestjs/swagger';
import { AuditorInternalDTO } from '@rehuo/auditor/dtos/auditor.dto';
import { BaseDTO, JwtInternalDTO } from '@rehuo/common/dtos/base.response.dto';
import { UserInternalDTO } from '@rehuo/user/dtos/user.dto';
import { Exclude, Expose } from 'class-transformer';

/**
 * 用户登录返回DTO
 */
@Exclude()
export class UserLoginedDTO extends UserInternalDTO {
  @Expose()
  @ApiProperty({
    type: JwtInternalDTO,
    description: '令牌信息',
  })
  token: JwtInternalDTO;
}

/**
 * 审核者登录返回DTO
 */
@Exclude()
export class AuditorLoginedDTO extends AuditorInternalDTO {
  @Expose()
  @ApiProperty({
    type: JwtInternalDTO,
    description: '令牌信息',
  })
  token: JwtInternalDTO;
}

/**
 * 认证返回信息
 */
export class AuthResponseDTO extends BaseDTO {
  constructor() {
    super();
  }

  @ApiProperty({
    type: UserLoginedDTO,
    description: '用户登录成功返回信息',
  })
  user: UserLoginedDTO;

  @ApiProperty({
    type: AuditorLoginedDTO,
    description: '审核者登录返回信息',
  })
  auditor: AuditorLoginedDTO;
}
