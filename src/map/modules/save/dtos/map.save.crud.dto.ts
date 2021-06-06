import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

/**
 * 创建地图收藏DTO
 */
export class MapSaveCreateDTO {
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @ApiProperty({
    type: Number,
    minimum: 1,
    description: '地图创作者ID',
  })
  createrId: number;

  @IsNotEmpty()
  @IsOptional()
  @IsNumber()
  @ApiProperty({
    type: Number,
    minimum: -1,
    description: '点位分类ID',
    required: false,
  })
  sortId: number;

  userId: number;
}

/**
 * 删除地图收藏DTO
 */
export class MapSaveDeleteDTO {
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @ApiProperty({
    type: Number,
    minimum: 1,
    description: '地图创作者ID',
  })
  createrId: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    type: Number,
    minimum: -1,
    description: '点位分类ID',
  })
  sortId: number;

  userId: number;
}
