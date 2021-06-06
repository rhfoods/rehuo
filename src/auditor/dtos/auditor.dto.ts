import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

/**
 * 返回的后台审核人员信息
 */
@Exclude()
export class AuditorInternalDTO {
  @Expose()
  @ApiProperty({
    type: String,
    description: '账号名称,字符与数字的组合,长度不超过16字',
  })
  readonly account: string;

  @Expose()
  @ApiProperty({
    required: false,
    type: String,
    description: '名称',
  })
  readonly name: string;
}
