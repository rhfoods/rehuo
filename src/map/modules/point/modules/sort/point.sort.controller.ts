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
import { JwtTypes, SystemRoleTypes } from '@rehuo/common/constants/system.constant';
import { Role } from '@rehuo/common/decorators/role.decorator';
import { Token } from '@rehuo/common/decorators/token.decorator';
import { BaseDTO } from '@rehuo/common/dtos/base.response.dto';
import { RoleGuard } from '@rehuo/common/guards/role.guard';
import { TokenGuard } from '@rehuo/common/guards/token.guard';
import { ResponserInterceptor } from '@rehuo/common/interceptors/responser.interceptor';
import { IToken } from '@rehuo/common/interfaces/jwt.interface';
import { PageRequestPipe } from '@rehuo/common/pipes/page.request.pipe';
import {
  PointSortCreateDTO,
  PointSortDeleteDTO,
  PointSortGetDTO,
  PointSortGetPointsDTO,
  PointSortsGetDTO,
  PointSortUpdateByAuditorDTO,
  PointSortUpdateDTO,
} from './dtos/point.sort.crud.dto';
import {
  MapPointLittleInternalDTO,
  MapPointLittlesDTO,
  PointSortDTO,
  PointSortInternalDTO,
  PointSortsDTO,
} from './dtos/point.sort.dto';
import { PointSortService } from './point.sort.service';

@Controller('map/point')
export class PointSortController {
  constructor(private readonly psortService: PointSortService) {}

  /**
   * 创建点位分类
   */
  @UseInterceptors(new ResponserInterceptor(PointSortInternalDTO, 'sort'))
  @Post('sort')
  @UseGuards(TokenGuard)
  @Token(JwtTypes.ACCESS)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '创建点位分类',
    description: '通过用户访问令牌创建点位分类',
  })
  @ApiCreatedResponse({
    type: PointSortDTO,
    description: '创建后的点位信息',
  })
  @ApiBearerAuth()
  async create(@Body() cDto: PointSortCreateDTO, @Request() req): Promise<PointSortDTO> {
    const rDto = new PointSortDTO();

    const user: IToken = req.user;
    cDto.userId = user.id;

    rDto.sort = await this.psortService.createOne(cDto);

    return rDto;
  }

  /**
   * 更新点位分类
   */
  @UseInterceptors(new ResponserInterceptor(PointSortInternalDTO, 'sort'))
  @Put('sort')
  @UseGuards(TokenGuard)
  @Token(JwtTypes.ACCESS)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '更新点位分类',
    description: '通过用户访问令牌更新点位分类',
  })
  @ApiOkResponse({
    type: PointSortDTO,
    description: '更新后的点位分类',
  })
  @ApiBearerAuth()
  async update(@Body() uDto: PointSortUpdateDTO, @Request() req): Promise<PointSortDTO> {
    const rDto = new PointSortDTO();

    const user: IToken = req.user;
    const isSucceed = await this.psortService.updateOne(
      { sortId: uDto.sortId, userId: user.id },
      uDto,
    );
    if (!isSucceed) {
      rDto.error();
    }

    return rDto;
  }

  /**
   * 更新点位分类(仅后台审核人员允许操作)
   */
  @UseInterceptors(new ResponserInterceptor(PointSortInternalDTO, 'sort'))
  @Put('sort/audit')
  @UseGuards(TokenGuard, RoleGuard)
  @Role(SystemRoleTypes.AUDITOR)
  @Token(JwtTypes.ACCESS)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '更新点位分类',
    description: '通过审核人员访问令牌更新点位分类',
  })
  @ApiOkResponse({
    type: PointSortDTO,
    description: '更新后的点位分类',
  })
  @ApiBearerAuth()
  async updateByAuditor(
    @Body() uDto: PointSortUpdateByAuditorDTO,
  ): Promise<PointSortDTO> {
    const rDto = new PointSortDTO();

    const isSucceed = await this.psortService.updateOne(
      { sortId: uDto.sortId, userId: 0, cityCode: uDto.cityCode },
      uDto,
    );
    if (!isSucceed) {
      rDto.error();
    }

    return rDto;
  }

  /**
   * 删除点位分类
   */
  @Delete('sort')
  @UseGuards(TokenGuard)
  @Token(JwtTypes.ACCESS)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '删除点位分类',
    description: '通过用户访问令牌删除点位分类',
  })
  @ApiOkResponse({
    type: BaseDTO,
    description: '删除是否成功',
  })
  @ApiBearerAuth()
  async delete(@Body() dDto: PointSortDeleteDTO, @Request() req): Promise<BaseDTO> {
    const rDto = new BaseDTO();
    const user: IToken = req.user;

    const isSucceed = await this.psortService.deleteOne({
      sortId: dDto.sortId,
      userId: user.id,
    });
    if (!isSucceed) {
      rDto.error();
    }

    return rDto;
  }

  /**
   * 根据sortId获取分类信息
   */
  @UseInterceptors(new ResponserInterceptor(PointSortInternalDTO, 'sort'))
  @Get('sort')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '获取分类信息',
    description: '通过sortId获取分类信息',
  })
  @ApiOkResponse({
    type: PointSortDTO,
    description: '分类信息',
  })
  async get(@Query() gDto: PointSortGetDTO): Promise<PointSortDTO> {
    const rDto = new PointSortDTO();

    rDto.sort = await this.psortService.getOne({
      sortId: gDto.sortId,
      userId: gDto.createrId,
    });

    return rDto;
  }

  /**
   * 获取用户点位分类下的极简点位信息
   */
  @UseInterceptors(new ResponserInterceptor(MapPointLittleInternalDTO, 'points'))
  @Get('sort/points')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '获取用户点位分类下的极简点位信息列表',
  })
  @ApiOkResponse({
    type: MapPointLittlesDTO,
    description: '用户点位分类下的极简点位信息列表',
  })
  async getLittle(@Query() gDto: PointSortGetPointsDTO): Promise<MapPointLittlesDTO> {
    const rDto = new MapPointLittlesDTO();
    const { points, page } = await this.psortService.getPoints(gDto);
    rDto.page = page;
    rDto.points = points;

    return rDto;
  }

  /**
   * 获取用户点位分类列表
   */
  @UseInterceptors(new ResponserInterceptor(PointSortInternalDTO, 'sorts'))
  @Get('sorts')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '获取用户点位分类列表',
  })
  @ApiOkResponse({
    type: PointSortsDTO,
    description: '用户点位分类列表',
  })
  async getAll(@Query(PageRequestPipe) gDto: PointSortsGetDTO): Promise<PointSortsDTO> {
    const rDto = new PointSortsDTO();
    const { sorts, page, totalPoints, defaultPoints } = await this.psortService.getAll(
      { userId: gDto.userId },
      gDto,
    );
    rDto.page = page;
    rDto.sorts = sorts;
    rDto.totalPoints = totalPoints;
    rDto.defaultPoints = defaultPoints;

    return rDto;
  }
}
