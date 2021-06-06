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
import { TokenGuard } from '@rehuo/common/guards/token.guard';
import { ResponserInterceptor } from '@rehuo/common/interceptors/responser.interceptor';
import { IToken } from '@rehuo/common/interfaces/jwt.interface';
import { NoteCommentPipe } from '@rehuo/common/pipes/note.comment.pipe';
import { PageRequestPipe } from '@rehuo/common/pipes/page.request.pipe';
import {
  NoteCommentCreateDTO,
  NoteCommentDeleteDTO,
  NoteCommentGetAllDTO,
  NoteCommentGetSubAllDTO,
  NoteCommentLikeDTO,
} from '../dtos/note.comment.crud.dto';
import {
  NoteCommentAnswerInternalDTO,
  NoteCommentDeleteResultDTO,
  NoteCommentDTO,
  NoteCommentInternalDTO,
  NoteCommentsDTO,
  NoteSubCommentInternalDTO,
  NoteSubCommentsDTO,
} from '../dtos/note.comment.dto';
import { NoteCommentService } from '../services/note.comment.service';

@Controller('map/point/note')
export class NoteCommentController {
  constructor(private readonly ncommentService: NoteCommentService) {}

  /**
   * 创建评论
   */
  @UseInterceptors(new ResponserInterceptor(NoteCommentInternalDTO, 'comment'))
  @Post('comment')
  @UseGuards(TokenGuard)
  @Token(JwtTypes.ACCESS)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '创建评论',
    description: '通过用户访问令牌创建评论',
  })
  @ApiCreatedResponse({
    type: NoteCommentDTO,
    description: '创建后的评论信息',
  })
  @ApiBearerAuth()
  async create(
    @Body(NoteCommentPipe) cDto: NoteCommentCreateDTO,
    @Request() req,
  ): Promise<NoteCommentDTO> {
    const rDto = new NoteCommentDTO();

    const user: IToken = req.user;
    cDto.userId = user.id;

    rDto.note = await this.ncommentService.createOne(cDto);

    return rDto;
  }

  /**
   * 删除评论
   */
  @Delete('comment')
  @UseGuards(TokenGuard)
  @Token(JwtTypes.ACCESS)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '删除评论',
    description: '通过用户访问令牌删除评论',
  })
  @ApiOkResponse({
    type: NoteCommentDeleteResultDTO,
    description: '删除的返回结果',
  })
  @ApiBearerAuth()
  async delete(
    @Body() dDto: NoteCommentDeleteDTO,
    @Request() req,
  ): Promise<NoteCommentDeleteResultDTO> {
    const rDto = new NoteCommentDeleteResultDTO();
    const user: IToken = req.user;
    dDto.userId = user.id;

    rDto.counts = await this.ncommentService.deleteOne(dDto);
    return rDto;
  }

  /**
   * 获取评论列表
   */
  @UseInterceptors(new ResponserInterceptor(NoteCommentAnswerInternalDTO, 'comments'))
  @Get('comments')
  @UseGuards(TokenGuard)
  @Token(JwtTypes.ACCESS)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '获取评论',
  })
  @ApiOkResponse({
    type: NoteCommentsDTO,
    description: '评论信息',
  })
  @ApiBearerAuth()
  async getAll(
    @Query(PageRequestPipe) gDto: NoteCommentGetAllDTO,
    @Request() req,
  ): Promise<NoteCommentsDTO> {
    const rDto = new NoteCommentsDTO();
    const user: IToken = req.user;
    gDto.userId = user.id;
    const result = await this.ncommentService.getAll(gDto);
    return Object.assign(rDto, result);
  }

  /**
   * 获取子评论列表
   */
  @UseInterceptors(new ResponserInterceptor(NoteSubCommentInternalDTO, 'comments'))
  @UseGuards(TokenGuard)
  @Token(JwtTypes.ACCESS)
  @Get('subcomments')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '获取子评论列表',
  })
  @ApiOkResponse({
    type: NoteSubCommentsDTO,
    description: '子评论信息列表',
  })
  async getSubAll(
    @Query(PageRequestPipe) gDto: NoteCommentGetSubAllDTO,
    @Request() req,
  ): Promise<NoteSubCommentsDTO> {
    const user: IToken = req.user;
    gDto.userId = user.id;
    const rDto = new NoteSubCommentsDTO();
    const result = await this.ncommentService.getSubAll(gDto);

    return Object.assign(rDto, result);
  }

  /**
   * 评论点赞与取消点赞
   */
  @Post('comment/like')
  @UseGuards(TokenGuard)
  @Token(JwtTypes.ACCESS)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '对评论进行点赞或者取消点赞',
  })
  @ApiOkResponse({
    type: BaseDTO,
    description: '返回信息',
  })
  @ApiBearerAuth()
  async like(@Body() cDto: NoteCommentLikeDTO, @Request() req): Promise<BaseDTO> {
    const rDto = new BaseDTO();
    const user = req.user;
    cDto.userId = user.id;

    if (cDto.isLiked) {
      await this.ncommentService.createLike(cDto);
    } else {
      await this.ncommentService.deleteLike(cDto);
    }

    return rDto;
  }
}
