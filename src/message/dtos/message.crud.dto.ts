import { ApiProperty } from '@nestjs/swagger';
import {
  MessageQueryTypes,
  MessageReturnTypes,
} from '@rehuo/common/constants/message.constant';
import { IdsRequestDTO } from '@rehuo/common/dtos/id.request.dto';
import { PageRequestDTO } from '@rehuo/common/dtos/page.request.dto';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

/**
 * 消息已阅DTO
 */
export class MessageReadsDTO extends IdsRequestDTO {
  userId: number;
}

/**
 * 获取消息DTO
 */
export class MessageGetsDTO extends PageRequestDTO {
  @IsEnum(MessageQueryTypes)
  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({
    enum: MessageQueryTypes,
    type: String,
    required: false,
    description: '消息类型',
  })
  type: MessageQueryTypes;

  userId: number;
}

/**
 * 获取最新消息DTO
 */
export class MessageGetNewsDTO extends PageRequestDTO {
  userId: number;
}
