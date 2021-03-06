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
   * ????????????
   */
  @UseInterceptors(new ResponserInterceptor(PointNoteInternalDTO, 'note'))
  @Post('note')
  @UseGuards(TokenGuard)
  @Token(JwtTypes.ACCESS)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '????????????',
    description: '????????????????????????????????????',
  })
  @ApiCreatedResponse({
    type: PointNoteDTO,
    description: '????????????????????????',
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
   * ????????????
   */
  @UseInterceptors(new ResponserInterceptor(PointNoteInternalDTO, 'note'))
  @Put('note')
  @UseGuards(TokenGuard)
  @Token(JwtTypes.ACCESS)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '????????????',
    description: '????????????????????????????????????',
  })
  @ApiOkResponse({
    type: PointNoteDTO,
    description: '????????????????????????',
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
   * ????????????
   */
  @Delete('note')
  @UseGuards(TokenGuard)
  @Token(JwtTypes.ACCESS)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '????????????',
    description: '????????????????????????????????????',
  })
  @ApiOkResponse({
    type: BaseDTO,
    description: '??????????????????',
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
   * ????????????
   */
  @UseInterceptors(new ResponserInterceptor(PointNoteInternalDTO, 'note'))
  @Get('note')
  @UseGuards(TokenGuard)
  @Token(JwtTypes.ACCESS)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '????????????',
  })
  @ApiOkResponse({
    type: PointNoteDTO,
    description: '????????????',
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
   * ??????????????????
   */
  @UseInterceptors(new ResponserInterceptor(PointNoteUserInternalDTO, 'notes'))
  @Get('notes')
  @UseGuards(TokenGuard)
  @Token(JwtTypes.ACCESS)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '??????????????????',
  })
  @ApiOkResponse({
    type: PointNoteUsersDTO,
    description: '??????????????????',
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
   * ??????????????????
   */
  @UseInterceptors(new ResponserInterceptor(PointNoteUserInternalDTO, 'notes'))
  @Get('note/more')
  @UseGuards(TokenGuard)
  @Token(JwtTypes.ACCESS)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '??????????????????',
  })
  @ApiOkResponse({
    type: PointNoteUsersDTO,
    description: '??????????????????',
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
   * ???????????????????????????
   */
  @Post('note/like')
  @UseGuards(TokenGuard)
  @Token(JwtTypes.ACCESS)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '???????????????????????????????????????',
  })
  @ApiOkResponse({
    type: BaseDTO,
    description: '????????????',
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
   * ????????????
   */
  @UseInterceptors(new ResponserInterceptor(MapPointSaveInternalDTO, 'point'))
  @Post('note/save')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '????????????',
  })
  @UseGuards(TokenGuard)
  @Token(JwtTypes.ACCESS)
  @ApiOkResponse({
    type: PointNoteSavedDTO,
    description: '??????????????????',
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
   * ????????????
   */
  @Delete('note/save')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '??????????????????',
  })
  @UseGuards(TokenGuard)
  @Token(JwtTypes.ACCESS)
  @ApiOkResponse({
    type: BaseDTO,
    description: '???????????????????????????',
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
   * ???????????????????????????
   */
  @UseInterceptors(new ResponserInterceptor(PointNoteInternalDTO, 'note'))
  @Get('note/simple')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '???????????????????????????',
  })
  @ApiOkResponse({
    type: PointNoteDTO,
    description: '?????????????????????',
  })
  async getSimple(@Query() gDto: PointNoteGetDTO): Promise<PointNoteDTO> {
    const rDto = new PointNoteDTO();

    rDto.note = await this.pnoteService.getSimple({
      noteId: gDto.noteId,
    });
    return rDto;
  }

  /**
   * ????????????????????????
   */
  @UseInterceptors(new ResponserInterceptor(PointNoteUserInternalDTO, 'notes'))
  @Get('note/all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '?????????????????????????????????',
  })
  @ApiOkResponse({
    type: PointNoteUsersDTO,
    description: '??????????????????',
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
   * ??????????????????
   */
  @Post('note/audit')
  @HttpCode(HttpStatus.OK)
  @UseGuards(TokenGuard, RoleGuard)
  @Token(JwtTypes.ACCESS)
  @Role(SystemRoleTypes.AUDITOR)
  @ApiOperation({
    summary: '????????????',
  })
  @ApiOkResponse({
    type: BaseDTO,
    description: '??????????????????',
  })
  async audit(@Body() gDto: PointNoteAuditDTO): Promise<BaseDTO> {
    const rDto = new BaseDTO();
    await this.pnoteService.audit(gDto.noteId);

    return rDto;
  }
}
