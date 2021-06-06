import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { JwtTypes } from '@rehuo/common/constants/system.constant';
import { Token } from '@rehuo/common/decorators/token.decorator';
import { TokenGuard } from '@rehuo/common/guards/token.guard';
import { ResponserInterceptor } from '@rehuo/common/interceptors/responser.interceptor';
import { HintDTO, HintInternalDTO } from './dtos/hint.dto';
import { HintService } from './hint.service';

@Controller('hint')
export class HintController {
  constructor(private readonly hintService: HintService) {}

  /**
   * 获取用户提示消息数量
   */
  @UseInterceptors(new ResponserInterceptor(HintInternalDTO, 'hint'))
  @Get()
  @Token(JwtTypes.ACCESS)
  @UseGuards(TokenGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '获取用户提示消息数量',
  })
  @ApiOkResponse({
    type: HintDTO,
    description: '用户提示消息数量',
  })
  @ApiBearerAuth()
  async get(@Request() req): Promise<HintDTO> {
    const rDto = new HintDTO();
    const user = req.user;
    rDto.hint = await this.hintService.getOne(user.id);

    return rDto;
  }
}
