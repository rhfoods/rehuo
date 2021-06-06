import { ApiProperty } from '@nestjs/swagger';
import { BaseDTO } from '@rehuo/common/dtos/base.response.dto';
import { PageResponseDTO } from '@rehuo/common/dtos/page.response.dto';
import { UserCommonDTO } from '@rehuo/user/dtos/user.dto';
import { Exclude, Expose } from 'class-transformer';

/**
 * 地图收藏信息
 */
@Exclude()
export class MapSaveInternalDTO extends UserCommonDTO {
  @Expose()
  @ApiProperty({
    type: Number,
    description: '地图创作者ID',
  })
  createrId: number;

  @Expose()
  @ApiProperty({
    type: Number,
    description: '分类Id，为null则表示所有点位，为0则表示默认收藏',
  })
  sortId: number;

  @Expose()
  @ApiProperty({
    type: String,
    description: '分类名称',
  })
  sortName: string;
}

/**
 * 地图收藏DTO数据
 */
export class MapSaveDTO extends BaseDTO {
  constructor() {
    super();
  }

  @ApiProperty({
    type: MapSaveInternalDTO,
    description: '地图收藏信息',
  })
  save: MapSaveInternalDTO;
}

/**
 * 地图收藏列表DTO数据
 */
export class MapSavesDTO extends PageResponseDTO {
  constructor() {
    super();
  }

  @ApiProperty({
    type: [MapSaveInternalDTO],
    description: '地图收藏信息列表',
  })
  saves: MapSaveInternalDTO[];
}
