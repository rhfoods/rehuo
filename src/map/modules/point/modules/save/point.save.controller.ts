import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
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
import { PageRequestPipe } from '@rehuo/common/pipes/page.request.pipe';
import { MapPointSaveDTO, MapPointSaveInternalDTO } from '../../dtos/map.point.dto';
import {
  PointNoteSetTopDTO,
  PointSaveCreateDTO,
  PointSaveDeleteDTO,
  PointSaveGetDTO,
  PointSaveGetMoreDTO,
  PointSaveGetMyDTO,
  PointSaveUpdateDTO,
} from './dtos/point.save.crud.dto';
import { MapPointNoteInternalDTO, MapPointNotesDTO } from './dtos/point.save.dto';
import { PointSaveService } from './point.save.service';

@Controller('map/point')
export class PointSaveController {
  constructor(private readonly psaveService: PointSaveService) {}

  /**
   * 收藏点位
   */
  @UseInterceptors(new ResponserInterceptor(MapPointSaveInternalDTO, 'point'))
  @Post('save')
  @UseGuards(TokenGuard)
  @Token(JwtTypes.ACCESS)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '收藏点位',
    description: '通过用户访问令牌收藏点位',
  })
  @ApiCreatedResponse({
    type: MapPointSaveDTO,
    description: '创建后的点位信息',
  })
  @ApiBearerAuth()
  async create(
    @Body() cDto: PointSaveCreateDTO,
    @Request() req,
  ): Promise<MapPointSaveDTO> {
    const rDto = new MapPointSaveDTO();

    const user: IToken = req.user;
    cDto.userId = user.id;

    rDto.point = await this.psaveService.createOne(cDto);

    return rDto;
  }

  /**
   * 更新点位收藏
   */
  @Put('save')
  @UseGuards(TokenGuard)
  @Token(JwtTypes.ACCESS)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '更新点位收藏',
  })
  @ApiOkResponse({
    type: BaseDTO,
    description: '更新后的点位收藏信息',
  })
  @ApiBearerAuth()
  async update(@Body() uDto: PointSaveUpdateDTO, @Request() req): Promise<BaseDTO> {
    const rDto = new BaseDTO();
    const user: IToken = req.user;

    await this.psaveService.updateOne({ psaveId: uDto.psaveId, userId: user.id }, uDto);

    return rDto;
  }

  /**
   * 通过点位收藏ID查看点位收藏基本信息
   */
  @UseInterceptors(new ResponserInterceptor(MapPointSaveInternalDTO, 'point'))
  @Get('save/base')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '通过点位收藏ID获取点位基本信息',
  })
  @ApiOkResponse({
    type: MapPointSaveDTO,
    description: '点位收藏信息和点位信息',
  })
  async get(@Query() gDto: PointSaveGetDTO, @Request() req): Promise<MapPointSaveDTO> {
    const payload: IToken = req.user;
    const rDto = new MapPointSaveDTO();

    rDto.point = await this.psaveService.getPoint(gDto);

    return rDto;
  }

  /**
   * 通过点位收藏ID获取点位信息和点位收藏信息
   */
  @UseInterceptors(new ResponserInterceptor(MapPointSaveInternalDTO, 'point'))
  @UseGuards(TokenGuard)
  @Token(JwtTypes.ACCESS)
  @Get('save')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '通过点位收藏ID获取点位信息和点位收藏信息',
  })
  @ApiOkResponse({
    type: MapPointSaveDTO,
    description: '点位收藏信息和点位信息',
  })
  @ApiBearerAuth()
  async getMore(
    @Query() gDto: PointSaveGetMoreDTO,
    @Request() req,
  ): Promise<MapPointSaveDTO> {
    const payload: IToken = req.user;
    const rDto = new MapPointSaveDTO();
    gDto.userId = payload.id;

    rDto.point = await this.psaveService.getPointMore(gDto);

    return rDto;
  }

  /**
   * 删除点位收藏
   */
  @Delete('save')
  @UseGuards(TokenGuard)
  @Token(JwtTypes.ACCESS)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '删除点位收藏',
  })
  @ApiOkResponse({
    type: BaseDTO,
    description: '是否删除成功',
  })
  @ApiBearerAuth()
  async delete(@Body() dDto: PointSaveDeleteDTO, @Request() req): Promise<BaseDTO> {
    const rDto = new BaseDTO();
    const user: IToken = req.user;
    await this.psaveService.deleteOne({
      psaveId: dDto.psaveId,
      userId: user.id,
    });

    return rDto;
  }

  /**
   * 置顶文章
   */
  @Put('savetop')
  @UseGuards(TokenGuard)
  @Token(JwtTypes.ACCESS)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '置顶文章',
  })
  @ApiOkResponse({
    type: BaseDTO,
    description: '是否置顶成功',
  })
  @ApiBearerAuth()
  async setTop(@Body() uDto: PointNoteSetTopDTO, @Request() req): Promise<BaseDTO> {
    const rDto = new BaseDTO();
    const user: IToken = req.user;
    uDto.userId = user.id;

    const isSucceed = await this.psaveService.setTop(uDto, uDto.noteId);
    if (!isSucceed) {
      rDto.error();
    }

    return rDto;
  }

  /**
   * 获取用户创建的点位信息
   */
  @UseGuards(TokenGuard)
  @Token(JwtTypes.ACCESS)
  @UseInterceptors(new ResponserInterceptor(MapPointNoteInternalDTO, 'points'))
  @Get('mys')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '获取用户创建或者写过文章的点位信息',
  })
  @ApiOkResponse({
    type: MapPointNotesDTO,
    description: '返回对应的点位信息',
  })
  @ApiBearerAuth()
  async getMy(
    @Query(PageRequestPipe) gDto: PointSaveGetMyDTO,
    @Request() req,
  ): Promise<MapPointNotesDTO> {
    const rDto = new MapPointNotesDTO();

    const user: IToken = req.user;
    if (!gDto.userId) {
      gDto.userId = user.id;
    }
    const { points, page } = await this.psaveService.getMy(gDto);
    rDto.page = page;
    rDto.points = points;

    return rDto;
  }

  /**
   * 获取自己收藏的点位信息
   */
  @UseInterceptors(new ResponserInterceptor(MapPointNoteInternalDTO, 'points'))
  @UseGuards(TokenGuard)
  @Token(JwtTypes.ACCESS)
  @Get('saves')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '获取自己收藏的点位信息',
  })
  @ApiOkResponse({
    type: MapPointNotesDTO,
    description: '返回对应的点位信息',
  })
  @ApiBearerAuth()
  async getSave(
    @Query(PageRequestPipe) pageDto: PageRequestDTO,
    @Request() req,
  ): Promise<MapPointNotesDTO> {
    const rDto = new MapPointNotesDTO();
    const user: IToken = req.user;

    const { points, page } = await this.psaveService.getSave(
      { userId: user.id },
      pageDto,
    );
    rDto.page = page;
    rDto.points = points;

    return rDto;
  }
}
