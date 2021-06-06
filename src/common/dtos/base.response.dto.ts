import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ReturnStatus } from '../constants/system.constant';

/**
 * API请求返回状态定义
 */
export class BaseDTO {
  @IsEnum(ReturnStatus)
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    enum: ReturnStatus,
    description: 'API请求返回状态定义',
  })
  returnCode: ReturnStatus;

  constructor() {
    this.returnCode = ReturnStatus.OK;
  }

  /**
   * 设置返回状态为失败
   */
  error() {
    this.returnCode = ReturnStatus.ERR;
  }
}

/**
 * 双JWT载荷定义(被其它DTO集成)
 */
export class JwtInternalDTO {
  @ApiProperty({
    description: '权限访问token',
  })
  access: string;

  @ApiProperty({
    description: '更新token',
    required: false,
  })
  refresh: string;
}

/**
 * OSS载荷定义(被其它DTO集成)
 */
export class OssInternalDTO {
  @ApiProperty({
    type: Object,
    description: '访问令牌和刷新令牌信息',
  })
  sts: Record<string, any>;
}

/**
 * 双JWT载荷定义
 */
export class JwtDTO extends BaseDTO {
  constructor() {
    super();
  }

  @ApiProperty({
    type: JwtInternalDTO,
    description: '访问令牌和刷新令牌信息',
  })
  token: JwtInternalDTO;
}
