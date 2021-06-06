import { ApiProperty } from '@nestjs/swagger';
import { BaseDTO } from '@rehuo/common/dtos/base.response.dto';
import { IIcon } from '@rehuo/common/interfaces/icon.interface';

/**
 * 点位媒体DTO数据
 */
export class MediasDTO extends BaseDTO {
  constructor() {
    super();
  }

  @ApiProperty({
    type: [String],
    description: '点位媒体信息',
  })
  medias: string[];

  @ApiProperty({
    type: Object,
    description: '访问OSS的令牌',
  })
  sts: Record<string, any>;
}

/**
 * 点位媒体DTO数据
 */
export class IconsDTO extends BaseDTO {
  constructor() {
    super();
  }

  @ApiProperty({
    type: [Object],
    description: 'ICON信息',
  })
  icons: IIcon[];
}
