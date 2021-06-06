import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigNamespaces } from '@rehuo/common/constants/config.constant';
import { CryptoHashAlgs, CryptoHashTypes } from '@rehuo/common/constants/crypto.constant';
import { SystemEnvironments } from '@rehuo/common/constants/system.constant';
import { WechatMinMsgTokens } from '@rehuo/common/constants/wechat.constant';
import { CryptoService } from '@rehuo/common/providers/crypto.service';
import { WechatService } from '@rehuo/shared/services/wechat.service';

@Injectable()
export class WeixinService {
  constructor(
    private readonly wechatService: WechatService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 处理用户通过小程序发起获取客服信息的请求
   */
  async usmsg(body: any): Promise<any> {
    const wxConf = this.configService.get(ConfigNamespaces.WECHAT);
    if (body.ToUserName !== wxConf.WxMiniUser.originId) {
      Logger.error(`receive invalid Message from wechat Server: ${JSON.stringify(body)}`);
      return 'failure';
    }
    const MessageTpl = {
      touser: body.FromUserName,
      msgtype: 'image',
      image: {
        media_id: wxConf.mediaIds.kefu,
      },
    };
    if (body.Content && body.Content === '1') {
      await this.wechatService.customerMessage(
        wxConf.token.user.access_token,
        MessageTpl,
      );
    }
    return 'success';
  }

  /**
   * 验证小程序后台配置参数
   */
  async verifyParam(query: any): Promise<any> {
    const msg = query;
    const token =
      this.configService.get(ConfigNamespaces.APP).env === SystemEnvironments.PROD
        ? WechatMinMsgTokens.PROD
        : WechatMinMsgTokens.DEV;

    const list = [];
    list.push(token);
    list.push(msg.timestamp);
    list.push(msg.nonce);
    list.sort();
    const wantEncrypt = list.join('');

    const encrypted = CryptoService.SignByHash(wantEncrypt, {
      alg: CryptoHashAlgs.SHA1,
      type: CryptoHashTypes.HASH,
    });
    if (encrypted === msg.signature.toUpperCase()) {
      return msg.echostr;
    }
  }
}
