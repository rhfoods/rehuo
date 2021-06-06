import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
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
import { PageRequestDTO } from '@rehuo/common/dtos/page.request.dto';
import { TokenGuard } from '@rehuo/common/guards/token.guard';
import { ResponserInterceptor } from '@rehuo/common/interceptors/responser.interceptor';
import { IToken } from '@rehuo/common/interfaces/jwt.interface';
import { MapSaveCreateDTO, MapSaveDeleteDTO } from './dtos/map.save.crud.dto';
import { MapSaveDTO, MapSaveInternalDTO, MapSavesDTO } from './dtos/map.save.dto';
import { MapSaveService } from './map.save.service';

@Controller('map')
export class MapSaveController {
  constructor(private readonly mapsaveService: MapSaveService) {}

  /**
   * 收藏地图
   */
  @UseInterceptors(new ResponserInterceptor(MapSaveInternalDTO, 'save'))
  @Post('save')
  @UseGuards(TokenGuard)
  @Token(JwtTypes.ACCESS)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '收藏别人的地图',
    description: '通过用户访问令牌收藏别人的地图',
  })
  @ApiCreatedResponse({
    type: MapSaveDTO,
    description: '收藏地图后返回的信息',
  })
  @ApiBearerAuth()
  async create(@Body() cDto: MapSaveCreateDTO, @Request() req): Promise<MapSaveDTO> {
    const rDto = new MapSaveDTO();

    const user: IToken = req.user;
    cDto.userId = user.id;
    rDto.save = await this.mapsaveService.createOne(cDto);

    return rDto;
  }

  /**
   * 取消地图收藏
   */
  @Delete('save')
  @UseGuards(TokenGuard)
  @Token(JwtTypes.ACCESS)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '取消地图收藏',
    description: '通过用户Id取消地图收藏',
  })
  @ApiOkResponse({
    type: BaseDTO,
    description: '是否成功',
  })
  @ApiBearerAuth()
  async delete(@Body() dDto: MapSaveDeleteDTO, @Request() req): Promise<BaseDTO> {
    const rDto = new BaseDTO();
    const user: IToken = req.user;
    dDto.userId = user.id;

    const isSucceed = await this.mapsaveService.deleteOne(dDto);
    if (!isSucceed) {
      rDto.error();
    }
    return rDto;
  }

  /**
   * 获取收藏的地图列表信息
   */
  @UseInterceptors(new ResponserInterceptor(MapSaveInternalDTO, 'saves'))
  @Get('saves')
  @UseGuards(TokenGuard)
  @Token(JwtTypes.ACCESS)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '获取收藏的地图列表信息',
    description: '通过用户访问令牌获取收藏的地图列表信息',
  })
  @ApiOkResponse({
    type: MapSavesDTO,
    description: '收藏的地图列表',
  })
  @ApiBearerAuth()
  async getAll(@Query() pageDto: PageRequestDTO, @Request() req): Promise<MapSavesDTO> {
    const rDto = new MapSavesDTO();
    const user: IToken = req.user;

    const { page, msaves } = await this.mapsaveService.getAll(
      { userId: user.id },
      pageDto,
    );
    rDto.page = page;
    rDto.saves = msaves;

    return rDto;
  }
}
