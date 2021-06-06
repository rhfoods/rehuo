import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Put,
  Query,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { JwtTypes } from '@rehuo/common/constants/system.constant';
import { Token } from '@rehuo/common/decorators/token.decorator';
import { TokenGuard } from '@rehuo/common/guards/token.guard';
import { ResponserInterceptor } from '@rehuo/common/interceptors/responser.interceptor';
import { IToken } from '@rehuo/common/interfaces/jwt.interface';
import { UserGetDTO, UserUpdateDTO } from './dtos/user.crud.dto';
import { UserDTO, UserInternalDTO } from './dtos/user.dto';
import { UserService } from './services/user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * 更新用户信息
   */
  @Put()
  @UseGuards(TokenGuard)
  @Token(JwtTypes.ACCESS)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '更新用户信息',
    description: '通过用户访问令牌更新用户信息',
  })
  @ApiOkResponse({
    type: UserDTO,
    description: '更新后的用户信息',
  })
  @ApiBearerAuth()
  async update(@Body() uDto: UserUpdateDTO, @Request() req): Promise<UserDTO> {
    const rDto = new UserDTO();

    const user: IToken = req.user;
    const isSucceed = await this.userService.updateOne({ userId: user.id }, uDto);
    if (!isSucceed) {
      rDto.error();
    }

    return rDto;
  }

  /**
   * 获取用户信息
   */
  @UseInterceptors(new ResponserInterceptor(UserInternalDTO, 'user'))
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '获取用户信息',
    description: '通过用户Id获取用户基本信息',
  })
  @ApiOkResponse({
    type: UserDTO,
    description: '获取用户基本信息',
  })
  async get(@Query() gDto: UserGetDTO): Promise<UserDTO> {
    const rDto = new UserDTO();

    rDto.user = await this.userService.getOne({ userId: gDto.userId });
    return rDto;
  }

  /**
   * 获取用户信息，包括提示信息
   */
  @UseInterceptors(new ResponserInterceptor(UserInternalDTO, 'user'))
  @Get('profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '通过用户Id获取用户信息，包括消息提示信息、相关统计数据',
  })
  @ApiOkResponse({
    type: UserDTO,
    description: '用户信息',
  })
  async profile(@Query() gDto: UserGetDTO): Promise<UserDTO> {
    const rDto = new UserDTO();
    rDto.user = await this.userService.getMore({ userId: gDto.userId });
    return rDto;
  }
}
