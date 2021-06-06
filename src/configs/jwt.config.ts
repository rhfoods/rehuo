import { registerAs } from '@nestjs/config';
import { ConfigNamespaces } from '@rehuo/common/constants/config.constant';
import { JwtSecretKey } from '@rehuo/common/constants/jwt.constant';

/**
 * JWT相关参数配置
 */
export default registerAs(ConfigNamespaces.JWT, () => ({
  merchant: {
    accessTime: process.env.JWT_MERCHANT_ACCESS_TOKEN,
    refreshTime: process.env.JWT_MERCHANT_REFRESH_TOKEN,
  },
  user: {
    accessTime: process.env.JWT_USER_ACCESS_TOKEN,
  },
  auditor: {
    accessTime: process.env.JWT_AUDITOR_ACCESS_TOKEN,
    refreshTime: process.env.JWT_AUDITOR_REFRESH_TOKEN,
  },
  secretKey: JwtSecretKey,
}));
