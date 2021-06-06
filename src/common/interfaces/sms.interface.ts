import { SmsSignTypes, SmsTemplateTypes } from '../constants/sms.constant';

/**
 * SMS短信请求参数定义
 */
export interface ISmsParam {
  PhoneNumbers: string; //发送目的手机号
  SmsData: Record<string, any>; //短信内容
  RegionId?: string; //SMS发送区域ID
  SignName?: SmsSignTypes; //短信签名名称
  TemplateCode?: SmsTemplateTypes; //短信模板代码
  ExpireTime?: number; //短信验证码过期时间
}
