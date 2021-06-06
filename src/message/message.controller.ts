import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { JwtTypes } from '@rehuo/common/constants/system.constant';
import { Token } from '@rehuo/common/decorators/token.decorator';
import { BaseDTO } from '@rehuo/common/dtos/base.response.dto';
import { TokenGuard } from '@rehuo/common/guards/token.guard';
import { ResponserInterceptor } from '@rehuo/common/interceptors/responser.interceptor';
import { IToken } from '@rehuo/common/interfaces/jwt.interface';
import { IdsRequestPipe } from '@rehuo/common/pipes/ids.request.pipe';
import {
  PointNoteUserInternalDTO,
  PointNoteUsersDTO,
} from '@rehuo/map/modules/point/modules/note/dtos/point.note.dto';
import { MessageGetsDTO, MessageReadsDTO } from './dtos/message.crud.dto';
import { MessageInternalDTO, MessagesDTO } from './dtos/message.dto';
import { MessageService } from './message.service';
@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  /**
   * 查看消息
   */
  @UseInterceptors(new ResponserInterceptor(MessageInternalDTO, 'messages'))
  @Get()
  @UseGuards(TokenGuard)
  @Token(JwtTypes.ACCESS)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '查看消息',
    description: '通过用户访问令牌查看消息',
  })
  @ApiOkResponse({
    type: MessagesDTO,
    description: '消息信息',
  })
  @ApiBearerAuth()
  async get(@Query() gDto: MessageGetsDTO, @Request() req): Promise<MessagesDTO> {
    const rDto = new MessagesDTO();

    const user: IToken = req.user;
    gDto.userId = user.id;

    const { page, messages } = await this.messageService.get(gDto);
    rDto.page = page;
    rDto.messages = messages;

    return rDto;
  }

  /**
   * 查看最新消息
   */
  @UseInterceptors(new ResponserInterceptor(PointNoteUserInternalDTO, 'notes'))
  @Get('news')
  @UseGuards(TokenGuard)
  @Token(JwtTypes.ACCESS)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '查看最新消息（最新文章）',
    description: '通过用户访问令牌查看最新消息',
  })
  @ApiOkResponse({
    type: PointNoteUsersDTO,
    description: '文章信息列表',
  })
  @ApiBearerAuth()
  async getNews(
    @Query() gDto: MessageGetsDTO,
    @Request() req,
  ): Promise<PointNoteUsersDTO> {
    const rDto = new PointNoteUsersDTO();

    const user: IToken = req.user;
    gDto.userId = user.id;

    const { page, notes } = await this.messageService.getNews(gDto);
    rDto.page = page;
    rDto.notes = notes;

    return rDto;
  }
}
