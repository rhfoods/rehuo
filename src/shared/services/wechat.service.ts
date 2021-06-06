import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotAcceptableException,
  RequestTimeoutException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigNamespaces } from '@rehuo/common/constants/config.constant';
import { CryptoCipherAlgs } from '@rehuo/common/constants/crypto.constant';
import { ERRORS } from '@rehuo/common/constants/error.constant';
import { TMapKey } from '@rehuo/common/constants/lbs.constant';
import { RedisTimeouts } from '@rehuo/common/constants/redis.constant';
import { SystemEnvironments } from '@rehuo/common/constants/system.constant';
import {
  WechatDataTypes,
  WechatMiniTypes,
  WECHAT_SCENE_ID,
  WxCreatorCenter,
  WxCreatorCenterTest,
} from '@rehuo/common/constants/wechat.constant';
import { ICryptoCipherReq } from '@rehuo/common/interfaces/crypto.interface';
import {
  IWechatCodeReq,
  IWechatDataReq,
  IWechatLoginReq,
  IWechatOpenId,
  IWechatSecReq,
} from '@rehuo/common/interfaces/wechat.interface';
import { CryptoService } from '@rehuo/common/providers/crypto.service';
import { HttpService } from '@rehuo/common/providers/http.service';
import { IPCMsgTypes } from '@rehuo/system/types/ipc.constant';
import { IIPCMsgReq } from '@rehuo/system/types/ipc.interface';
import * as _fs from 'fs';
import * as _request from 'superagent';

@Injectable()
export class WechatService {
  private logger: Logger;
  private wxConf;

  constructor(private readonly configService: ConfigService) {
    this.logger = new Logger();
    this.logger.setContext(WechatService.name);
    this.wxConf = configService.get(ConfigNamespaces.WECHAT);
  }

  /**
   * 对scene数据进行编码
   */
  private encodeScene(req: IWechatDataReq): string {
    if (req.type === WechatDataTypes.TRANSFER) {
      const buffer = Buffer.alloc(8);
      const expiredTime =
        Math.floor(new Date().getTime() / 1000) + RedisTimeouts.QRCODE_TRANSFER;
      buffer.writeUInt32LE(req.transfer.userId, 0);
      buffer.writeInt32LE(expiredTime, 4);

      return req.type + req.transfer.phone + buffer.toString('hex') + WECHAT_SCENE_ID;
    } else {
      let formatStr;
      if (req.type === WechatDataTypes.MAP) {
        const buffer = Buffer.alloc(8);
        if (req.share.cityCode) {
          buffer.writeUInt32LE(0, 0);
          buffer.writeInt32LE(req.share.commonId, 4);
          formatStr =
            req.type + buffer.toString('hex') + req.share.cityCode + WECHAT_SCENE_ID;
        } else {
          buffer.writeUInt32LE(req.share.id, 0);
          buffer.writeInt32LE(req.share.commonId, 4);
          formatStr = req.type + buffer.toString('hex') + WECHAT_SCENE_ID;
        }
      } else {
        const buffer = Buffer.alloc(12);
        buffer.writeUInt32LE(req.share.id, 0);
        buffer.writeUInt32LE(req.share.commonId, 4);
        if (req.share.topNoteId) {
          buffer.writeUInt32LE(req.share.topNoteId, 8);
        }
        formatStr = req.type + buffer.toString('hex') + WECHAT_SCENE_ID;
      }
      return formatStr;
    }
  }

  /**
   * 对scene数据进行解码
   */
  decodeScene(scene: string): IWechatDataReq {
    const type: any = scene.slice(0, 1);
    const id = scene.slice(scene.length - 1);
    const data = scene.slice(1, scene.length - 1);

    if (!Object.values(WechatDataTypes).includes(type) || id !== WECHAT_SCENE_ID) {
      throw new BadRequestException(ERRORS.WECHAT_REQUEST_CODE);
    }

    if (type === WechatDataTypes.TRANSFER) {
      const phone = data.slice(0, 11);
      const spec = data.slice(11);
      const buffer = Buffer.from(spec, 'hex');
      if (buffer.readUInt32LE(4) < Math.floor(new Date().getTime() / 1000)) {
        throw new BadRequestException(ERRORS.TRANSFER_EXPIRED);
      }

      const result: IWechatDataReq = {
        type,
        transfer: {
          phone,
          userId: buffer.readUInt32LE(0),
        },
      };

      return result;
    } else {
      const buffer = Buffer.from(data, 'hex');
      const id = buffer.readUInt32LE(0);
      let commonId;
      if (type === WechatDataTypes.MAP) {
        commonId = buffer.readInt32LE(4);
      } else {
        commonId = buffer.readUInt32LE(4);
      }

      const noteId = buffer.readUInt32LE(8);
      const result: IWechatDataReq = {
        type,
        share: {
          id,
          commonId,
        },
      };
      noteId > 0 ? (result.share.topNoteId = noteId) : null;

      return result;
    }
  }

  /**
   * 返回不同微信小程序对应的配置信息
   */
  private wechatConf(type: WechatMiniTypes): any {
    let wxConf;
    if (type === WechatMiniTypes.MERCHANT) {
      wxConf = this.wxConf.WxMiniMerchant;
    } else if (type === WechatMiniTypes.USER) {
      wxConf = this.wxConf.WxMiniUser;
    } else {
      wxConf = this.wxConf.WxPublicAccount;
    }

    return wxConf;
  }

  /**
   * 返回不同微信小程序对应的TOKEN信息
   */
  private wechatToken(type: WechatMiniTypes): any {
    let token;
    if (type === WechatMiniTypes.MERCHANT) {
      token = this.wxConf.token.merchant;
    } else if (type === WechatMiniTypes.USER) {
      token = this.wxConf.token.user;
    } else {
      token = this.wxConf.token.publicAccount;
    }

    return token;
  }

  /**
   * 获取用户微信openid
   * @param {string} code 微信登录临时凭证
   * @returns 成功返回获取到的微信openId，失败抛出异常
   * @memberof Weixin
   */
  async openId(type: WechatMiniTypes, req: IWechatLoginReq): Promise<IWechatOpenId> {
    let decrypted, result;
    const wxConf = this.wechatConf(type);

    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${wxConf.appId}&secret=${wxConf.appSecret}&js_code=${req.code}&grant_type=authorization_code`;
    try {
      result = await HttpService.get(url);
    } catch (err) {
      this.logger.error(err.message);
      throw new RequestTimeoutException(ERRORS.WECHAT_REQUEST);
    }

    const wxBody = JSON.parse(result.text);

    //检查是否获取到openid
    if (wxBody.errcode !== 0 && !wxBody.openid) {
      this.logger.error(wxBody);
      throw new NotAcceptableException(ERRORS.WECHAT_REQUEST_OPENID);
    }

    //获取unionId
    if (!wxBody.unionid && req.encryptedData && req.iv) {
      const cryptoReq: ICryptoCipherReq = {
        alg: CryptoCipherAlgs.AES_CBC_128,
        key: wxBody.session_key,
        iv: req.iv,
      };

      decrypted = CryptoService.DecryptWechat(req.encryptedData, cryptoReq);
      decrypted = JSON.parse(decrypted);
      if (decrypted.watermark.appid !== wxConf.appId) {
        this.logger.error('watermark dismatched: ' + decrypted);
        throw new NotAcceptableException(ERRORS.WECHAT_REQUEST_OPENID);
      }
    }
    const unionId = decrypted ? decrypted.unionId : wxBody.unionid;
    return { openId: wxBody.openid, unionId };
  }

  /**
   * 获取用户对应的unionId
   */
  async unoinId(token, openid) {
    let result;
    const url = `https://api.weixin.qq.com/cgi-bin/user/info?access_token=${token}&openid=${openid}&lang=zh_CN`;

    try {
      result = await HttpService.get(url);
    } catch (err) {
      this.logger.error(err.message);
      throw new RequestTimeoutException(ERRORS.WECHAT_REQUEST);
    }
    const wxBody = JSON.parse(result.body);

    //判断是否获取到unionid
    if (wxBody.errcode !== 0 && !wxBody.hasOwnProperty('unionid')) {
      this.logger.error(wxBody);
      throw new NotAcceptableException(ERRORS.WECHAT_REQUEST_OPENID);
    }

    return wxBody.unionid;
  }

  /**
   * 获取微信接口访问token
   * @param {WechatMiniTypes} type 微信小程序类型
   */
  async accessToken(type: WechatMiniTypes): Promise<any> {
    const wxConf = this.wechatConf(type);
    const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${wxConf.appId}&secret=${wxConf.appSecret}`;

    try {
      const result: any = await HttpService.get(url);
      const token =
        typeof result.body === 'string' ? JSON.parse(result.body) : result.body;

      if (!Object.keys(token).includes('access_token')) {
        this.logger.error(token);
      }
      return token;
    } catch (err) {
      this.logger.error(err.message);
      throw new RequestTimeoutException(ERRORS.WECHAT_REQUEST);
    }
  }

  /**
   * 尝试更新token
   */
  private async tryUpdateToken(type: WechatMiniTypes): Promise<any> {
    const token = await this.accessToken(type);
    let msg: IIPCMsgReq;
    const wechatConf = this.configService.get(ConfigNamespaces.WECHAT);

    switch (type) {
      case WechatMiniTypes.USER:
        msg = {
          type: IPCMsgTypes.WX_TOKEN_USER,
          userToken: token,
        };
        wechatConf.token = {
          user: msg.userToken,
        };
        break;
      case WechatMiniTypes.PUBLIC:
        msg = {
          type: IPCMsgTypes.WX_TOKEN_PUBLIC,
          publicToken: token,
        };
        wechatConf.token = {
          publicAccount: msg.publicToken,
        };
        break;
      case WechatMiniTypes.MERCHANT:
        msg = {
          type: IPCMsgTypes.WX_TOKEN_MERCHANT,
          merchantToken: token,
        };
        wechatConf.token = {
          merchant: msg.merchantToken,
        };
        break;
      default:
        break;
    }

    //更新信息同步给主进程
    process.send(msg);

    return token;
  }

  /**
   * 获取对应的微信二维码
   * @param {IWechatCodeReq} codeReq 二维码获取请求
   */
  async wxacode(codeReq: IWechatCodeReq): Promise<any> {
    const token = this.wechatToken(codeReq.code);
    const url = `https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${token.access_token}`;

    const req: any = {
      scene: this.encodeScene(codeReq.scene),
      width: codeReq.width || 280,
    };
    codeReq.page ? (req.page = codeReq.page) : null;
    codeReq.autoColor ? (req.autoColor = codeReq.autoColor) : null;
    codeReq.isHyaline ? (req.is_hyaline = codeReq.isHyaline) : null;

    try {
      const result: any = await HttpService.post(url, req);
      if (result.body instanceof Buffer) {
        return result.body.toString('base64');
      } else {
        this.logger.error(result);
        throw new Error();
      }
    } catch (err) {
      if (err.message) {
        this.logger.error(err.message);
      }
      const newToken = await this.tryUpdateToken(WechatMiniTypes.USER);
      /**
       * 重新操作
       */
      const url = `https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${newToken.access_token}`;
      const req: any = {
        scene: this.encodeScene(codeReq.scene),
        width: codeReq.width || 280,
      };
      codeReq.page ? (req.page = codeReq.page) : null;
      codeReq.autoColor ? (req.autoColor = codeReq.autoColor) : null;
      codeReq.isHyaline ? (req.is_hyaline = codeReq.isHyaline) : null;

      try {
        const result: any = await HttpService.post(url, req);
        if (result.body instanceof Buffer) {
          return result.body.toString('base64');
        } else {
          this.logger.error(result);
          throw new Error();
        }
      } catch (err) {
        if (err.message) {
          this.logger.error(err.message);
        }
        throw new RequestTimeoutException(ERRORS.WECHAT_REQUEST);
      }
    }
  }

  /**
   * 文字内容安全审查
   */
  async msgSecCheck(req: IWechatSecReq): Promise<any> {
    const token = this.wechatToken(req.code);
    const url = `https://api.weixin.qq.com/wxa/msg_sec_check?access_token=${token.access_token}`;

    try {
      const result: any = await HttpService.post(url, { content: req.content });
      if (result.body.errcode === 87014) {
        throw new ForbiddenException(ERRORS.WECHAT_SEC_CHECK);
      }
      return true;
    } catch (err) {
      console.log(err);
      /**
       * 当出现网络异常时，默认返回true
       */
      return true;
    }
  }

  /**
   * 获取一个点位的POI
   */
  async getPOI(latitude: number, longitude: number): Promise<string> {
    const env = this.configService.get(ConfigNamespaces.APP).env;
    const lbsKey = env === SystemEnvironments.PROD ? TMapKey.PROD : TMapKey.DEV;
    const url = `https://apis.map.qq.com/ws/geocoder/v1/?location=${latitude},${longitude}&key=${lbsKey}&get_poi=1`;
    let result;

    try {
      result = await HttpService.get(url);
      return result.body.result.ad_info.adcode;
    } catch (err) {
      this.logger.error(err.message);
      throw new RequestTimeoutException(ERRORS.LBS_POI);
    }
  }

  /**
   * 获取SNS访问TOKEN
   */
  async snsAccessToken(code: string) {
    const creatorCenter =
      this.configService.get(ConfigNamespaces.APP).env === SystemEnvironments.PROD
        ? WxCreatorCenter
        : WxCreatorCenterTest;
    const url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${creatorCenter.appId}&secret=${creatorCenter.appSecret}&code=${code}&grant_type=authorization_code`;

    try {
      const result: any = await HttpService.get(url);
      return JSON.parse(result.text);
    } catch (err) {
      this.logger.error(err.message);
      throw new RequestTimeoutException(ERRORS.WECHAT_REQUEST);
    }
  }

  /**
   * 发送客服消息
   */
  async customerMessage(token, param) {
    let url = `https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=${token}`;

    try {
      const result: any = await HttpService.post(url, param);
      const body = result.body;
      if (body.errcode === 0 && body.errmsg === 'ok') {
        return body;
      } else {
        this.logger.error(result);
        const newToken = await this.tryUpdateToken(WechatMiniTypes.USER);
        url = `https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=${newToken.access_token}`;
        const res: any = await HttpService.post(url, param);
        const body = res.body;
        if (body.errcode === 0 && body.errmsg === 'ok') {
          return body;
        } else {
          this.logger.error(res);
          throw new RequestTimeoutException(ERRORS.WECHAT_REQUEST);
        }
      }
    } catch (err) {
      this.logger.error(err.message);
      const newToken = await this.tryUpdateToken(WechatMiniTypes.USER);
      url = `https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=${newToken.access_token}`;
      const result: any = await HttpService.post(url, param);
      const body = result.body;
      if (body.errcode === 0 && body.errmsg === 'ok') {
        return body;
      } else {
        this.logger.error(result);
        throw new RequestTimeoutException(ERRORS.WECHAT_REQUEST);
      }
    }
  }

  /**
   * 上传客服图片到微信服务器
   */
  async uploadTempMedia(type: WechatMiniTypes, file: string) {
    const wxToken = await this.accessToken(type);
    const url = `https://api.weixin.qq.com/cgi-bin/media/upload?access_token=${wxToken.access_token}&type=image`;

    try {
      const result = await _request
        .post(url)
        .type('form')
        .field('media', _fs.createReadStream(file));
      if (!result.text) {
        Logger.error('upload Media to Wechat server occur exception', WechatService.name);
      }
      const body = JSON.parse(result.text);

      return body.media_id;
    } catch (err) {
      Logger.error(err, WechatService.name);
    }
  }
}
