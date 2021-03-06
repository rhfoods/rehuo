import {
  BadRequestException,
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
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { ERRORS } from '@rehuo/common/constants/error.constant';
import { JwtTypes } from '@rehuo/common/constants/system.constant';
import { WechatDataTypes } from '@rehuo/common/constants/wechat.constant';
import { Token } from '@rehuo/common/decorators/token.decorator';
import { BaseDTO } from '@rehuo/common/dtos/base.response.dto';
import { TokenGuard } from '@rehuo/common/guards/token.guard';
import { ResponserInterceptor } from '@rehuo/common/interceptors/responser.interceptor';
import { IToken } from '@rehuo/common/interfaces/jwt.interface';
import { PageRequestPipe } from '@rehuo/common/pipes/page.request.pipe';
import {
  CityPointDetailGetDTO,
  CityPointNotesGetDTO,
  CityPointsNearDTO,
  CitySortPointsGetDTO,
  MapGetAreaDTO,
  MapGetDTO,
  MapGetScopeDTO,
  MapQrCodeCreateDTO,
  MapTransferDTO,
  PublicMapTransferDTO,
  QrCodeCheckDTO,
} from './dtos/map.crud.dto';
import {
  CityInfoInternalDTO,
  CityPointNoteInternalDTO,
  CityPointNotesDTO,
  MapPointInternalDTO,
  MapPointsDTO,
  MapQrCodeDTO,
  MapsDTO,
  PublicCitysDTO,
} from './dtos/map.dto';
import {
  MapPointSaveDTO,
  MapPointSaveInternalDTO,
} from './modules/point/dtos/map.point.dto';
import { CitySortsGetDTO } from './modules/point/modules/sort/dtos/point.sort.crud.dto';
import {
  PointSortInternalDTO,
  PointSortsDTO,
} from './modules/point/modules/sort/dtos/point.sort.dto';
import { PointSortService } from './modules/point/modules/sort/point.sort.service';
import { PublicMapService } from './services/public.map.service';
import { UserMapService } from './services/user.map.service';

@Controller('map')
export class MapController {
  constructor(
    private readonly umapService: UserMapService,
    private readonly pmapService: PublicMapService,
    private readonly psortService: PointSortService,
  ) {}

  /**
   * ????????????ID?????????????????????
   */
  @UseInterceptors(new ResponserInterceptor(MapPointInternalDTO, 'points'))
  @Get()
  @Token(JwtTypes.ACCESS)
  @UseGuards(TokenGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '??????????????????',
    description: '????????????ID??????????????????',
  })
  @ApiOkResponse({
    type: MapPointsDTO,
    description: '?????????????????????',
  })
  @ApiBearerAuth()
  async getSimple(@Query() gDto: MapGetDTO, @Request() req): Promise<MapPointsDTO> {
    const rDto = new MapPointsDTO();
    const payload: IToken = req.user;
    gDto.userId = payload.id;

    const { totalPoints, points, isSaved } = await this.umapService.get(gDto);

    rDto.points = points;
    rDto.totalPoints = totalPoints;
    isSaved !== undefined ? (rDto.isSaved = isSaved) : null;

    return rDto;
  }

  /**
   * ????????????ID?????????????????????(???????????????)
   * @notes ???????????????????????????????????????????????????????????????????????????
   */
  @UseInterceptors(new ResponserInterceptor(MapPointInternalDTO, 'points'))
  @UseInterceptors(new ResponserInterceptor(CityInfoInternalDTO, 'maps'))
  @Get('scope')
  @Token(JwtTypes.ACCESS)
  @UseGuards(TokenGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '??????????????????',
    description: '????????????ID??????????????????',
  })
  @ApiOkResponse({
    type: MapsDTO,
    description: '?????????????????????',
  })
  @ApiBearerAuth()
  async getScope(@Query() gDto: MapGetScopeDTO, @Request() req): Promise<MapsDTO> {
    const rDto = new MapsDTO();
    const payload: IToken = req.user;
    gDto.userId = payload.id;

    const { type, points, maps, isSaved, scale } = await this.umapService.getScope(gDto);

    rDto.type = type;
    points ? (rDto.points = points) : null;
    maps ? (rDto.maps = maps) : null;
    scale ? (rDto.scale = scale) : null;
    isSaved !== undefined ? (rDto.isSaved = isSaved) : null;

    return rDto;
  }

  /**
   * ?????????????????????????????????
   */
  @UseInterceptors(new ResponserInterceptor(MapPointInternalDTO, 'points'))
  @UseInterceptors(new ResponserInterceptor(CityInfoInternalDTO, 'maps'))
  @Get('area')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '??????????????????????????????????????????',
  })
  @ApiOkResponse({
    type: MapsDTO,
    description: '?????????????????????',
  })
  async getArea(@Query() gDto: MapGetAreaDTO): Promise<MapsDTO> {
    const rDto = new MapsDTO();
    const { type, points, maps, isSaved, scale } = await this.umapService.getArea(gDto);

    rDto.type = type;
    points ? (rDto.points = points) : null;
    maps ? (rDto.maps = maps) : null;
    scale ? (rDto.scale = scale) : null;
    isSaved !== undefined ? (rDto.isSaved = isSaved) : null;

    return rDto;
  }

  /**
   * ??????????????????
   */
  @Token(JwtTypes.ACCESS)
  @UseGuards(TokenGuard)
  @Post('wxcode')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({
    type: MapQrCodeDTO,
    description: '?????????????????????',
  })
  @ApiBearerAuth()
  async getQrCode(
    @Body() cDto: MapQrCodeCreateDTO,
    @Request() req,
  ): Promise<MapQrCodeDTO> {
    const rDto = new MapQrCodeDTO();
    const payload: IToken = req.user;

    if (cDto.scene.type === WechatDataTypes.TRANSFER) {
      cDto.scene.transfer.userId = payload.id;
    }

    rDto.qrCode = await this.umapService.createQrCode(cDto);
    return rDto;
  }

  /**
   * ??????????????????????????????
   */
  @Get('wxcode')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: BaseDTO,
    description: '????????????????????????',
  })
  async checkQrCode(@Query() gDto: QrCodeCheckDTO): Promise<BaseDTO> {
    const rDto = new BaseDTO();

    const isSucceed = await this.umapService.checkQrCode(gDto.scene);
    if (!isSucceed) {
      rDto.error();
    }
    return rDto;
  }

  /**
   * ????????????
   */
  @Token(JwtTypes.ACCESS)
  @UseGuards(TokenGuard)
  @Post('transfer')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: BaseDTO,
    description: '??????????????????',
  })
  @ApiBearerAuth()
  async transfer(@Body() cDto: MapTransferDTO, @Request() req): Promise<BaseDTO> {
    const rDto = new BaseDTO();
    const payload: IToken = req.user;
    cDto.userId = payload.id;

    if (cDto.userId === cDto.providerId) {
      throw new BadRequestException(ERRORS.PARAMS_INVALID);
    }

    const isSucceed = await this.umapService.transfer(cDto);
    if (!isSucceed) {
      rDto.error();
    }

    return rDto;
  }

  /**
   * ????????????????????????
   */
  @Token(JwtTypes.ACCESS)
  @UseGuards(TokenGuard)
  @Post('transfer/public')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: BaseDTO,
    description: '??????????????????',
  })
  @ApiBearerAuth()
  async transferPublicMap(
    @Body() cDto: PublicMapTransferDTO,
    @Request() req,
  ): Promise<BaseDTO> {
    const rDto = new BaseDTO();
    const payload: IToken = req.user;
    cDto.userId = payload.id;
    if (cDto.userId !== cDto.providerId) {
      throw new BadRequestException(ERRORS.PARAMS_INVALID);
    }

    const isSucceed = await this.umapService.transferPublicMap(cDto);
    if (!isSucceed) {
      rDto.error();
    }

    return rDto;
  }

  /**
   * ???????????????????????????
   */
  @UseInterceptors(new ResponserInterceptor(CityInfoInternalDTO, 'citys'))
  @Get('citys')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: PublicCitysDTO,
    description: '???????????????????????????',
  })
  async publiCitys(): Promise<PublicCitysDTO> {
    const rDto = new PublicCitysDTO();
    rDto.citys = await this.pmapService.publicCitys();

    return rDto;
  }

  /**
   * ???????????????????????????
   */
  @UseInterceptors(new ResponserInterceptor(PointSortInternalDTO, 'sorts'))
  @Get('city/sorts')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '??????????????????',
  })
  @ApiOkResponse({
    type: PointSortsDTO,
    description: '??????????????????',
  })
  async citySorts(@Query() gDto: CitySortsGetDTO): Promise<PointSortsDTO> {
    const rDto = new PointSortsDTO();
    const { sorts, page } = await this.pmapService.citySorts(gDto);
    rDto.page = page;
    rDto.sorts = sorts;

    return rDto;
  }

  /**
   * ???????????????????????????????????????
   */
  @UseInterceptors(new ResponserInterceptor(MapPointInternalDTO, 'points'))
  @Get('city/sort/points')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '???????????????????????????????????????',
  })
  @ApiOkResponse({
    type: MapPointsDTO,
    description: '????????????',
  })
  async citySortPoints(@Query() gDto: CitySortPointsGetDTO): Promise<MapPointsDTO> {
    if (Number(gDto.sortId) < 1) {
      throw new BadRequestException(ERRORS.PARAMS_INVALID);
    }

    const rDto = new MapPointsDTO();
    rDto.points = await this.pmapService.citySortPoints(gDto);

    return rDto;
  }

  /**
   * ???????????????????????????????????????
   */
  @UseInterceptors(new ResponserInterceptor(CityPointNoteInternalDTO, 'notes'))
  @Get('city/point/notes')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '???????????????????????????????????????',
  })
  @ApiOkResponse({
    type: CityPointNotesDTO,
    description: '????????????',
  })
  async pointNotes(
    @Query(PageRequestPipe) gDto: CityPointNotesGetDTO,
  ): Promise<CityPointNotesDTO> {
    const rDto = new CityPointNotesDTO();
    const { notes, page } = await this.pmapService.cityPointNotes(gDto);
    rDto.notes = notes;
    rDto.page = page;

    return rDto;
  }

  /**
   * ??????????????????????????????
   */
  @UseInterceptors(new ResponserInterceptor(MapPointSaveInternalDTO, 'point'))
  @Get('city/point/profile')
  @Token(JwtTypes.ACCESS)
  @UseGuards(TokenGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '??????????????????????????????',
  })
  @ApiOkResponse({
    type: MapPointSaveDTO,
    description: '????????????',
  })
  @ApiBearerAuth()
  async pointProfile(
    @Query() gDto: CityPointDetailGetDTO,
    @Request() req,
  ): Promise<MapPointSaveDTO> {
    if (gDto.psaveId < 1) {
      throw new BadRequestException(ERRORS.PARAMS_INVALID);
    }

    const rDto = new MapPointSaveDTO();
    const payload: IToken = req.user;
    gDto.userId = payload.id;

    rDto.point = await this.pmapService.cityPointDetail(gDto);

    return rDto;
  }

  /**
   * ???????????????????????????
   */
  @UseInterceptors(new ResponserInterceptor(MapPointSaveInternalDTO, 'point'))
  @Get('city/near')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '???????????????????????????',
  })
  @ApiOkResponse({
    type: MapPointsDTO,
    description: '?????????????????????????????????',
  })
  @ApiBearerAuth()
  async findNear(@Query() gDto: CityPointsNearDTO): Promise<MapPointsDTO> {
    const rDto = new MapPointsDTO();
    rDto.points = await this.pmapService.findNear(gDto);

    return rDto;
  }
}
