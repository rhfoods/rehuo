import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOperation } from '@nestjs/swagger';
import { JwtTypes } from '@rehuo/common/constants/system.constant';
import { Token } from '@rehuo/common/decorators/token.decorator';
import { BaseDTO } from '@rehuo/common/dtos/base.response.dto';
import { TokenGuard } from '@rehuo/common/guards/token.guard';
import { IToken } from '@rehuo/common/interfaces/jwt.interface';
import { UserClockDTO } from './dtos/user.clock.crud.dto';
import { UserClockService } from './user.clock.service';

@Controller('user/clock')
export class UserClockController {
  constructor(private readonly uclockService: UserClockService) {}

  /**
   * 打卡
   */
  @Post()
  @UseGuards(TokenGuard)
  @Token(JwtTypes.ACCESS)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '打卡',
    description: '通过用户访问令牌打卡',
  })
  @ApiCreatedResponse({
    type: BaseDTO,
    description: '打卡是否成功',
  })
  @ApiBearerAuth()
  async update(@Body() cDto: UserClockDTO, @Request() req): Promise<BaseDTO> {
    const rDto = new BaseDTO();
    const user: IToken = req.user;
    cDto.userId = user.id;

    await this.uclockService.createOne(cDto);
    return rDto;
  }
}
