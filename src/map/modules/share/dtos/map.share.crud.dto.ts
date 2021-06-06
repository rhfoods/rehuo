import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

/**
 * 创建分享DTO
 */
export class MapShareCreateDTO {
  @IsNotEmpty()
  @IsNumber()
  @IsOptional()
  @Min(1)
  @ApiProperty({
    type: Number,
    minimum: 1,
    required: false,
    description: '分享的点位收藏ID',
  })
  psaveId: number;

  @IsNotEmpty()
  @IsNumber()
  @IsOptional()
  @Min(1)
  @ApiProperty({
    type: Number,
    minimum: 1,
    required: false,
    description: '分享的文章ID',
  })
  noteId: number;

  @IsNotEmpty()
  @IsNumber()
  @IsOptional()
  @Min(1)
  @ApiProperty({
    type: Number,
    minimum: 1,
    required: false,
    description: '分享的地图创作者ID',
  })
  createrId: number;

  userId: number;
}
