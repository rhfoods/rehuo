import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { JwtTypes } from '@rehuo/common/constants/system.constant';
import { Token } from '@rehuo/common/decorators/token.decorator';
import { BaseDTO } from '@rehuo/common/dtos/base.response.dto';
import { TokenGuard } from '@rehuo/common/guards/token.guard';
import { IToken } from '@rehuo/common/interfaces/jwt.interface';
import { MapSharePipe } from '@rehuo/common/pipes/map.share.pipe';
import { MapShareCreateDTO } from './dtos/map.share.crud.dto';
import { MapShareService } from './map.share.service';

@Controller('map')
export class MapShareController {
  constructor(private readonly mapshareService: MapShareService) {}

  /**
   * 分享数据统计
   */
  @Post('share')
  @UseGuards(TokenGuard)
  @Token(JwtTypes.ACCESS)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '统计分享数据',
  })
  @ApiOkResponse({
    type: BaseDTO,
    description: '返回成功',
  })
  @ApiBearerAuth()
  async create(
    @Body(MapSharePipe) cDto: MapShareCreateDTO,
    @Request() req,
  ): Promise<BaseDTO> {
    const rDto = new BaseDTO();

    const user: IToken = req.user;
    cDto.userId = user.id;
    await this.mapshareService.createOne(cDto);

    return rDto;
  }
}
