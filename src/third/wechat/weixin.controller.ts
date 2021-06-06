import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { WeixinService } from './weixin.service';

@Controller('third/wechat')
export class WeixinController {
  constructor(private readonly wxService: WeixinService) {}

  /**
   * 小程序消息请求
   */
  @Post('ucmsg')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '获取客服信息请求',
    description: '处理用户通过小程序发起获取客服信息请求',
  })
  @ApiBearerAuth()
  async ucmsg(@Body() body: any): Promise<any> {
    return this.wxService.usmsg(body);
  }

  /*
   * 验证微信小程序消息请求配置参数
   * */
  @Get('ucmsg')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '验证微信配置参数',
    description: '验证微信小程序消息请求配置参数',
  })
  async verifyUcmsgParam(@Query() query): Promise<any> {
    return this.wxService.verifyParam(query);
  }
}
