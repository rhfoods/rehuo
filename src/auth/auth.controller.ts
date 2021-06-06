import {
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ConfigNamespaces } from '@rehuo/common/constants/config.constant';
import { ERRORS } from '@rehuo/common/constants/error.constant';
import { JwtTypes, SystemRoleTypes } from '@rehuo/common/constants/system.constant';
import { Token } from '@rehuo/common/decorators/token.decorator';
import { BaseDTO, JwtDTO } from '@rehuo/common/dtos/base.response.dto';
import { TokenGuard } from '@rehuo/common/guards/token.guard';
import { ResponserInterceptor } from '@rehuo/common/interceptors/responser.interceptor';
import { IToken } from '@rehuo/common/interfaces/jwt.interface';
import { TokenService } from '@rehuo/shared/services/token.service';
import { AuthService } from './auth.service';
import { AuthRequestDTO } from './dtos/auth.request.dto';
import {
  AuditorLoginedDTO,
  AuthResponseDTO,
  UserLoginedDTO,
} from './dtos/auth.response.dto';
import { SmsGetDTO } from './dtos/sms.crud.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 注册和登录认证
   */
  @UseInterceptors(new ResponserInterceptor(UserLoginedDTO, 'user'))
  @UseInterceptors(new ResponserInterceptor(AuditorLoginedDTO, 'auditor'))
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '注册和登录认证',
  })
  @ApiOkResponse({
    type: AuthResponseDTO,
    description: '登录成功',
  })
  async login(@Body() aDto: AuthRequestDTO): Promise<AuthResponseDTO> {
    const rDto = new AuthResponseDTO();
    if (aDto.role === SystemRoleTypes.USER) {
      rDto.user = await this.authService.wxcodeLogin(
        aDto.role,
        aDto.miniType,
        aDto.wxCode,
      );
    } else if (aDto.role === SystemRoleTypes.AUDITOR) {
      rDto.auditor = await this.authService.auditorLogin(aDto.auditor);
    }
    return rDto;
  }

  /**
   * 通过刷新令牌更新访问令牌和刷新令牌
   */
  @UseInterceptors(new ResponserInterceptor(JwtDTO))
  @UseGuards(TokenGuard)
  @Post('token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '更新令牌',
    description: '通过刷新令牌更新访问刷新和访问令牌',
  })
  @ApiOkResponse({
    type: JwtDTO,
    description: '成功返回新令牌信息',
  })
  @ApiBearerAuth()
  async updateToken(@Request() req): Promise<JwtDTO> {
    const payload: IToken = req.user;
    const rDto = new JwtDTO();

    //审核者仅接受刷新令牌
    if (payload.rl === SystemRoleTypes.AUDITOR && payload.tk !== JwtTypes.REFRESH) {
      throw new ForbiddenException(ERRORS.TOKEN_ROLE_INVALID);
    }

    payload.en = this.configService.get(ConfigNamespaces.APP).env;
    rDto.token = await this.tokenService.create(payload);

    return rDto;
  }

  /**
   * 获取短信验证码
   */
  @Token(JwtTypes.ACCESS)
  @UseGuards(TokenGuard)
  @Post('sms')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '获取短信验证码',
    description: '通过访问令牌短信验证码接口',
  })
  @ApiOkResponse({
    type: BaseDTO,
    description: '通过刷新令牌获取短信验证码，成功则给对应手机号码发送短信验证码',
  })
  @ApiBearerAuth()
  async sms(@Body() body: SmsGetDTO, @Request() req): Promise<BaseDTO> {
    const payload: IToken = req.user;
    body.userId = payload.id;
    const dto = new BaseDTO();

    const isSucceed = await this.authService.sendSms(body);
    if (!isSucceed) {
      dto.error();
    }
    return dto;
  }
}
