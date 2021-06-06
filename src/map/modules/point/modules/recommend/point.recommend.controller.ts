import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Request,
  UseGuards,
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
import { IToken } from '@rehuo/common/interfaces/jwt.interface';
import { PointRecommendAuditPipe } from '@rehuo/common/pipes/point.recommend.pipe';
import {
  PointRecommendAuditDTO,
  PointRecommendCreateDTO,
} from './dtos/point.recommend.crud.dto';
import { PointRecommendService } from './point.recommend.service';

@Controller('map/point')
export class PointRecommendController {
  constructor(private readonly prService: PointRecommendService) {}
  /**
   * 创建点位推荐
   */
  @Post('recommend')
  @UseGuards(TokenGuard)
  @Token(JwtTypes.ACCESS)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '创建点位推荐',
    description: '通过用户访问令牌创建点位推荐',
  })
  @ApiCreatedResponse({
    type: BaseDTO,
    description: '创建是否成功',
  })
  @ApiBearerAuth()
  async create(@Body() cDto: PointRecommendCreateDTO, @Request() req): Promise<BaseDTO> {
    const rDto = new BaseDTO();

    const user: IToken = req.user;
    cDto.userId = user.id;

    const isSucceed = await this.prService.createOne(cDto);
    if (!isSucceed) {
      rDto.error();
    }

    return rDto;
  }

  /**
   * 审核点位推荐
   */
  @Put('recommend')
  @UseGuards(TokenGuard, RoleGuard)
  @Role(SystemRoleTypes.AUDITOR)
  @Token(JwtTypes.ACCESS)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '审核点位推荐',
    description: '通过审核员访问令牌审核点位推荐',
  })
  @ApiOkResponse({
    type: BaseDTO,
    description: '创建是否成功',
  })
  @ApiBearerAuth()
  async audit(
    @Body(PointRecommendAuditPipe) uDto: PointRecommendAuditDTO,
    @Request() req,
  ): Promise<BaseDTO> {
    const rDto = new BaseDTO();

    const user: IToken = req.user;
    uDto.auditorId = user.id;

    const isSucceed = await this.prService.audit(uDto);
    if (!isSucceed) {
      rDto.error();
    }

    return rDto;
  }
}
