import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ICONS } from '@rehuo/common/constants/icon.constant';
import { JwtTypes } from '@rehuo/common/constants/system.constant';
import { Token } from '@rehuo/common/decorators/token.decorator';
import { BaseDTO } from '@rehuo/common/dtos/base.response.dto';
import { TokenGuard } from '@rehuo/common/guards/token.guard';
import { IToken } from '@rehuo/common/interfaces/jwt.interface';
import { MediaCreateDTO, MediaDeleteDTO } from './dtos/media.crud.dto';
import { IconsDTO, MediasDTO } from './dtos/media.dto';
import { MediaService } from './services/media.service';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  /**
   * 生成点位媒体存储路径
   */
  @Post()
  @UseGuards(TokenGuard)
  @Token(JwtTypes.ACCESS)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '获取点位媒体存储路径和STS',
    description: '通过用户访问令牌获取点位媒体存储路径和STS',
  })
  @ApiOkResponse({
    type: MediasDTO,
    description: '点位媒体信息',
  })
  @ApiBearerAuth()
  async generate(@Body() cDto: MediaCreateDTO, @Request() req): Promise<MediasDTO> {
    const rDto = new MediasDTO();
    const user: IToken = req.user;
    cDto.createrId = user.id;

    const { sts, medias } = await this.mediaService.create(cDto);
    rDto.sts = sts;
    rDto.medias = medias;

    return rDto;
  }

  /**
   * 删除点位媒体存储路径
   */
  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '删除点位媒体存储路径',
    description: '通过用户访问令牌删除点位媒体存储路径',
  })
  @ApiOkResponse({
    type: BaseDTO,
    description: '是否删除成功',
  })
  @ApiBearerAuth()
  async delete(@Body() dDto: MediaDeleteDTO, @Request() req): Promise<BaseDTO> {
    const rDto = new BaseDTO();
    const user: IToken = req.user;
    dDto.createrId = user.id;

    await this.mediaService.delete(dDto);
    return rDto;
  }

  /**
   * 获取ICON信息
   */
  @Get('icons')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '获取ICON信息',
  })
  @ApiOkResponse({
    type: IconsDTO,
    description: '所有ICON信息',
  })
  async icons(): Promise<IconsDTO> {
    const rDto = new IconsDTO();
    rDto.icons = ICONS;

    return rDto;
  }
}
