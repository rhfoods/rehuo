import {
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigNamespaces } from '@rehuo/common/constants/config.constant';
import { ERRORS } from '@rehuo/common/constants/error.constant';
import { ISmsParam } from 'src/common/interfaces/sms.interface';
import RPCClient = require('@alicloud/pop-core');

@Injectable()
export class SmsService extends RPCClient {
  private logger: Logger;

  constructor(private readonly configService: ConfigService) {
    super(configService.get(ConfigNamespaces.SMS));
    this.logger = new Logger();
    this.logger.setContext(SmsService.name);
  }

  /**
   * 发送短信验证码，并把验证码保存到缓存中
   */
  async send(smsRequest: ISmsParam): Promise<any> {
    const req = {
      RegionId:
        smsRequest.RegionId || this.configService.get(ConfigNamespaces.SMS).regionId,
      SignName: smsRequest.SignName,
      TemplateCode: smsRequest.TemplateCode,
      TemplateParam: JSON.stringify(smsRequest.SmsData),
      PhoneNumbers: smsRequest.PhoneNumbers,
    };

    /**
     * 当向同一手机发送短信验证码过于频繁，会导致异常
     * 目前短信系统设置的是每分钟不超过3条短信
     */
    try {
      const result: any = await this.request('SendSms', req, {
        method: 'POST',
      });
      if (result.Code === 'OK') {
        return true;
      } else {
        this.logger.error(result);
        throw new ServiceUnavailableException(ERRORS.SMS_SEND);
      }
    } catch (err) {
      this.logger.error(err.message);
      throw new ServiceUnavailableException(ERRORS.SMS_SEND_TOOMUCH);
    }
  }

  /**
   * 短信验证
   * @param smsParam 短信验证请求
   */
  async verify(smsParam: ISmsParam, authCode: string): Promise<boolean> {
    if (!authCode) {
      throw new UnauthorizedException(ERRORS.SMS_EXPIRED);
    }

    if (authCode !== smsParam.SmsData.code) {
      throw new UnauthorizedException(ERRORS.SMS_VERIFY);
    }

    return true;
  }
}
