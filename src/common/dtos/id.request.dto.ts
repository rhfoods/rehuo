import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * 多个ID请求DTO
 */
export class IdsRequestDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: '请求的ID值数组信息，格式为11:12:13:14',
  })
  ids: string;

  idsArray: string[];
}
