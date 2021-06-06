import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { JwtTypes } from '@rehuo/common/constants/system.constant';
import { Token } from '@rehuo/common/decorators/token.decorator';
import { BaseDTO } from '@rehuo/common/dtos/base.response.dto';
import { TokenGuard } from '@rehuo/common/guards/token.guard';
import { ResponserInterceptor } from '@rehuo/common/interceptors/responser.interceptor';
import { IToken } from '@rehuo/common/interfaces/jwt.interface';
import { MapPointCreateDTO, MapPointUpdateDTO } from './dtos/map.point.crud.dto';
import { MapPointSaveDTO, MapPointSaveInternalDTO } from './dtos/map.point.dto';
import { MapPointService } from './services/map.point.service';

@Controller('map')
export class MapPointController {
  constructor(private readonly mpointService: MapPointService) {}

  /**
   * 创建点位
   */
  @UseInterceptors(new ResponserInterceptor(MapPointSaveInternalDTO, 'point'))
  @Post('point')
  @UseGuards(TokenGuard)
  @Token(JwtTypes.ACCESS)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '创建点位',
    description: '通过用户访问令牌创建点位',
  })
  @ApiCreatedResponse({
    type: MapPointSaveDTO,
    description: '创建后的点位信息',
  })
  @ApiBearerAuth()
  async create(
    @Body() cDto: MapPointCreateDTO,
    @Request() req,
  ): Promise<MapPointSaveDTO> {
    const rDto = new MapPointSaveDTO();

    const user: IToken = req.user;
    cDto.userId = user.id;
    rDto.point = await this.mpointService.createOne(cDto);

    return rDto;
  }

  /**
   * 更新点位
   */
  @UseInterceptors(new ResponserInterceptor(MapPointSaveInternalDTO, 'point'))
  @Put('point')
  @UseGuards(TokenGuard)
  @Token(JwtTypes.ACCESS)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '更新点位',
    description: '通过用户访问令牌更新点位',
  })
  @ApiOkResponse({
    type: BaseDTO,
    description: '更新是否成功',
  })
  @ApiBearerAuth()
  async update(@Body() uDto: MapPointUpdateDTO, @Request() req): Promise<BaseDTO> {
    const rDto = new BaseDTO();

    const user: IToken = req.user;

    await this.mpointService.updateOne({ psaveId: uDto.psaveId, userId: user.id }, uDto);

    return rDto;
  }
}
