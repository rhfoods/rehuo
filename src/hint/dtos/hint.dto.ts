import { ApiProperty } from '@nestjs/swagger';
import { BaseDTO } from '@rehuo/common/dtos/base.response.dto';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class HintInternalDTO {
  @Expose()
  @ApiProperty({
    type: Number,
    description: '收藏与置顶',
  })
  savetops: number;

  @Expose()
  @ApiProperty({
    type: Number,
    description: '打卡',
  })
  clocks: number;

  @Expose()
  @ApiProperty({
    type: Number,
    description: '点赞',
  })
  likes: number;

  @Expose()
  @ApiProperty({
    type: Number,
    description: '评论',
  })
  comments: number;

  @Expose()
  @ApiProperty({
    type: Number,
    description: '系统消息',
  })
  systems: number;
}

export class HintDTO extends BaseDTO {
  constructor() {
    super();
  }

  @ApiProperty({
    type: HintInternalDTO,
    description: '用户提示消息数量',
  })
  hint: HintInternalDTO;
}
