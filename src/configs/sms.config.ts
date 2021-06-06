import { registerAs } from '@nestjs/config';
import { ConfigNamespaces } from '@rehuo/common/constants/config.constant';

/**
 * SMS短信参数配置
 */
export default registerAs(ConfigNamespaces.SMS, () => ({
  accessKeyId: 'LTAI4Fv7pqn1zjSKC6JH2mVY',
  accessKeySecret: '1TK455OBribAP9mbV9lygYdOfLnD4g',
  endpoint: 'https://dysmsapi.aliyuncs.com',
  apiVersion: '2017-05-25',
  regionId: 'cn-chengdu',
  expiredTime: process.env.SMS_EXPIRED_TIME,
}));
