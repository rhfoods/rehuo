import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { BaseDTO } from './base.response.dto';

/**
 * 分页数据
 */
@Exclude()
export class PageResponseInternalDTO {
  @Expose()
  @ApiProperty({
    type: Number,
    description: '开始的第几条信息',
  })
  readonly start: number;

  @Expose()
  @ApiProperty({
    type: Number,
    description: '获取到的数量',
  })
  readonly take: number;

  @Expose()
  @ApiProperty({
    type: Number,
    description: '总数',
  })
  readonly amount: number;

  constructor(start, take, amount) {
    this.start = start;
    this.take = take;
    this.amount = amount;
  }
}

/**
 * 分页DTO
 */
export class PageResponseDTO extends BaseDTO {
  constructor() {
    super();
  }

  @ApiProperty({
    type: PageResponseInternalDTO,
    description: '分页信息',
  })
  page: PageResponseInternalDTO;
}
