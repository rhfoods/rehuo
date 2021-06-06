import { registerAs } from '@nestjs/config';
import { ConfigNamespaces } from '@rehuo/common/constants/config.constant';
import { SystemEnvironments } from '@rehuo/common/constants/system.constant';
import {
  WxMiniMerchant,
  WxMiniUser,
  WxMiniUserTest,
  WxPublicAccount,
  WxTenpay,
} from '@rehuo/common/constants/wechat.constant';
import { readFileSync } from 'fs';

/**
 * 微信相关参数配置
 */
export default registerAs(ConfigNamespaces.WECHAT, () => {
  return {
    tenpay: {
      mchId: WxTenpay.mchId,
      partnerKey: WxTenpay.partnerKey,
      publicKey: readFileSync(WxTenpay.libzxml),
    },
    WxMiniUser:
      process.env.APP_ENV === SystemEnvironments.DEV ||
      process.env.APP_ENV === SystemEnvironments.TESTING
        ? WxMiniUserTest
        : WxMiniUser,
    WxMiniMerchant,
    WxPublicAccount,
    tokenExpiredTime: parseInt(process.env.WX_TOKEN_EXPIRED_TIME, 10),
    token: null,
    mediaIds: {},
  };
});
