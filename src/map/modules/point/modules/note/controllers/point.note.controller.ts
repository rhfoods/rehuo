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
import { IdsRequestPipe } from '@rehuo/common/pipes/ids.request.pipe';
import { PageRequestPipe } from '@rehuo/common/pipes/page.request.pipe';
import { PointNotePipe } from '@rehuo/common/pipes/point.note.pipe';
import { MapPointSaveInternalDTO } from '../../../dtos/map.point.dto';
import {
  PointNoteAuditDTO,
  PointNoteCreateDTO,
  PointNoteDeleteDTO,
  PointNoteGetAllDTO,
  PointNoteGetDTO,
  PointNoteGetMoreDTO,
  PointNoteGetsDTO,
  PointNoteLikeDTO,
  PointNoteSaveDTO,
  PointNoteUpdateDTO,
} from '../dtos/point.note.crud.dto';
import {
  PointNoteDTO,
  PointNoteInternalDTO,
  PointNoteSavedDTO,
  PointNoteUserInternalDTO,
  PointNoteUsersDTO,
} from '../dtos/point.note.dto';
import { NoteStatService } from '../services/note.stat.service';
import { PointNoteService } from '../services/point.note.service';
// import { MapPointSaveInternalDTO } from '../../dtos/map.point.dto';
// import {
//   PointNoteAuditDTO,
//   PointNoteCreateDTO,
//   PointNoteDeleteDTO,
//   PointNoteGetAllDTO,
//   PointNoteGetDTO,
//   PointNoteGetMoreDTO,
//   PointNoteGetsDTO,
//   PointNoteLikeDTO,
//   PointNoteSaveDTO,
//   PointNoteUpdateDTO,
// } from './dtos/point.note.crud.dto';
// import {
//   PointNoteDTO,
//   PointNoteInternalDTO,
//   PointNoteSavedDTO,
//   PointNoteUserInternalDTO,
//   PointNoteUsersDTO,
// } from './dtos/point.note.dto';
// import { NoteStatService } from './services/note.stat.service';
// import { PointNoteService } from './services/point.note.service';

@Controller('map/point')
export class PointNoteController {
  constructor(
    private readonly pnoteService: PointNoteService,
    private readonly nlikeService: NoteStatService,
  ) {}

  /**
   * 创建文章
   */
  @UseInterceptors(new ResponserInterceptor(PointNoteInternalDTO, 'note'))
  @Post('note')
  @UseGuards(TokenGuard)
  @Token(JwtTypes.ACCESS)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '创建文章',
    description: '通过用户访问令牌创建文章',
  })
  @ApiCreatedResponse({
    type: PointNoteDTO,
    description: '创建后的文章信息',
  })
  @ApiBearerAuth()
  async create(
    @Body(PointNotePipe) cDto: PointNoteCreateDTO,
    @Request() req,
  ): Promise<PointNoteDTO> {
    const rDto = new PointNoteDTO();

    const user: IToken = req.user;
    cDto.userId = user.id;

    rDto.note = await this.pnoteService.createOne(cDto);

    return rDto;
  }

  /**
   * 更新文章
   */
  @UseInterceptors(new ResponserInterceptor(PointNoteInternalDTO, 'note'))
  @Put('note')
  @UseGuards(TokenGuard)
  @Token(JwtTypes.ACCESS)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '更新文章',
    description: '通过用户访问令牌更新文章',
  })
  @ApiOkResponse({
    type: PointNoteDTO,
    description: '更新后的文章信息',
  })
  @ApiBearerAuth()
  async update(
    @Body(PointNotePipe) uDto: PointNoteUpdateDTO,
    @Request() req,
  ): Promise<PointNoteDTO> {
    const rDto = new PointNoteDTO();
    const user: IToken = req.user;

    const isSucceed = await this.pnoteService.updateOne(
      { noteId: uDto.noteId, userId: user.id },
      uDto,
    );
    if (!isSucceed) {
      rDto.error();
    }

    return rDto;
  }

  /**
   * 删除文章
   */
  @Delete('note')
  @UseGuards(TokenGuard)
  @Token(JwtTypes.ACCESS)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '删除文章',
    description: '通过用户访问令牌删除文章',
  })
  @ApiOkResponse({
    type: BaseDTO,
    description: '删除是否成功',
  })
  @ApiBearerAuth()
  async delete(@Body() dDto: PointNoteDeleteDTO, @Request() req): Promise<BaseDTO> {
    const rDto = new BaseDTO();
    const user: IToken = req.user;

    const isSucceed = await this.pnoteService.deleteOne({
      noteId: dDto.noteId,
      userId: user.id,
    });
    if (!isSucceed) {
      rDto.error();
    }

    return rDto;
  }

  /**
   * 获取文章
   */
  @UseInterceptors(new ResponserInterceptor(PointNoteInternalDTO, 'note'))
  @Get('note')
  @UseGuards(TokenGuard)
  @Token(JwtTypes.ACCESS)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '获取文章',
  })
  @ApiOkResponse({
    type: PointNoteDTO,
    description: '文章信息',
  })
  @ApiBearerAuth()
  async get(@Query() gDto: PointNoteGetDTO, @Request() req): Promise<PointNoteDTO> {
    const rDto = new PointNoteDTO();
    const payload: IToken = req.user;

    rDto.note = await this.pnoteService.getOne({
      noteId: gDto.noteId,
      userId: payload.id,
    });
    return rDto;
  }

  /**
   * 获取多篇文章
   */
  @UseInterceptors(new ResponserInterceptor(PointNoteUserInternalDTO, 'notes'))
  @Get('notes')
  @UseGuards(TokenGuard)
  @Token(JwtTypes.ACCESS)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '获取多篇文章',
  })
  @ApiOkResponse({
    type: PointNoteUsersDTO,
    description: '文章信息列表',
  })
  @ApiBearerAuth()
  async getSome(
    @Query(IdsRequestPipe) gDto: PointNoteGetsDTO,
    @Request() req,
  ): Promise<PointNoteUsersDTO> {
    const payload: IToken = req.user;
    gDto.userId = payload.id;
    const rDto = new PointNoteUsersDTO();
    rDto.notes = await this.pnoteService.getSome(gDto);

    return rDto;
  }

  /**
   * 获取发现更多
   */
  @UseInterceptors(new ResponserInterceptor(PointNoteUserInternalDTO, 'notes'))
  @Get('note/more')
  @UseGuards(TokenGuard)
  @Token(JwtTypes.ACCESS)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '发现更多文章',
  })
  @ApiOkResponse({
    type: PointNoteUsersDTO,
    description: '文章信息列表',
  })
  async getMore(
    @Query(PageRequestPipe) gDto: PointNoteGetMoreDTO,
    @Request() req,
  ): Promise<PointNoteUsersDTO> {
    const payload: IToken = req.user;
    gDto.userId = payload.id;

    const rDto = new PointNoteUsersDTO();
    const { notes, page } = await this.pnoteService.getMore(gDto);
    rDto.notes = notes;
    rDto.page = page;

    return rDto;
  }

  /**
   * 文章点赞与取消点赞
   */
  @Post('note/like')
  @UseGuards(TokenGuard)
  @Token(JwtTypes.ACCESS)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '对文章进行点赞或者取消点赞',
  })
  @ApiOkResponse({
    type: BaseDTO,
    description: '返回信息',
  })
  @ApiBearerAuth()
  async like(@Body() cDto: PointNoteLikeDTO, @Request() req): Promise<BaseDTO> {
    const rDto = new BaseDTO();
    const user = req.user;
    cDto.userId = user.id;

    if (cDto.isLiked) {
      await this.nlikeService.createLike(cDto);
    } else {
      await this.nlikeService.deleteLike(cDto);
    }

    return rDto;
  }

  /**
   * 收藏文章
   */
  @UseInterceptors(new ResponserInterceptor(MapPointSaveInternalDTO, 'point'))
  @Post('note/save')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '收藏文章',
  })
  @UseGuards(TokenGuard)
  @Token(JwtTypes.ACCESS)
  @ApiOkResponse({
    type: PointNoteSavedDTO,
    description: '文章信息列表',
  })
  @ApiBearerAuth()
  async save(@Body() cDto: PointNoteSaveDTO, @Request() req): Promise<PointNoteSavedDTO> {
    const rDto = new PointNoteSavedDTO();
    const payload: IToken = req.user;
    cDto.userId = payload.id;

    rDto.point = await this.pnoteService.save(cDto);
    return rDto;
  }

  /**
   * 收藏文章
   */
  @Delete('note/save')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '取消收藏文章',
  })
  @UseGuards(TokenGuard)
  @Token(JwtTypes.ACCESS)
  @ApiOkResponse({
    type: BaseDTO,
    description: '是否成功的返回信息',
  })
  @ApiBearerAuth()
  async unsave(@Body() dDto: PointNoteSaveDTO, @Request() req): Promise<BaseDTO> {
    const rDto = new BaseDTO();
    const payload: IToken = req.user;
    dDto.userId = payload.id;

    const isSucceed = await this.pnoteService.unsave(dDto);
    if (!isSucceed) {
      rDto.error();
    }
    return rDto;
  }

  /**
   * 获取文章的部分信息
   */
  @UseInterceptors(new ResponserInterceptor(PointNoteInternalDTO, 'note'))
  @Get('note/simple')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '获取文章的部分信息',
  })
  @ApiOkResponse({
    type: PointNoteDTO,
    description: '文章的部分信息',
  })
  async getSimple(@Query() gDto: PointNoteGetDTO): Promise<PointNoteDTO> {
    const rDto = new PointNoteDTO();

    rDto.note = await this.pnoteService.getSimple({
      noteId: gDto.noteId,
    });
    return rDto;
  }

  /**
   * 查看所有文章列表
   */
  @UseInterceptors(new ResponserInterceptor(PointNoteUserInternalDTO, 'notes'))
  @Get('note/all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '不同状态的所有文章列表',
  })
  @ApiOkResponse({
    type: PointNoteUsersDTO,
    description: '文章信息列表',
  })
  async getAll(
    @Query(PageRequestPipe) gDto: PointNoteGetAllDTO,
  ): Promise<PointNoteUsersDTO> {
    const rDto = new PointNoteUsersDTO();
    const { notes, page } = await this.pnoteService.getAll(gDto);
    rDto.notes = notes;
    rDto.page = page;

    return rDto;
  }

  /**
   * 设置为已审核
   */
  @Post('note/audit')
  @HttpCode(HttpStatus.OK)
  @UseGuards(TokenGuard, RoleGuard)
  @Token(JwtTypes.ACCESS)
  @Role(SystemRoleTypes.AUDITOR)
  @ApiOperation({
    summary: '文章审核',
  })
  @ApiOkResponse({
    type: BaseDTO,
    description: '审核返回状态',
  })
  async audit(@Body() gDto: PointNoteAuditDTO): Promise<BaseDTO> {
    const rDto = new BaseDTO();
    await this.pnoteService.audit(gDto.noteId);

    return rDto;
  }
}
