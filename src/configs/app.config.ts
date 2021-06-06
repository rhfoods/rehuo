import { registerAs } from '@nestjs/config';
import { ConfigNamespaces } from '@rehuo/common/constants/config.constant';
import { SystemEnvironments } from '@rehuo/common/constants/system.constant';

export default registerAs(ConfigNamespaces.APP, () => ({
  env: process.env.APP_ENV || SystemEnvironments.DEV,
  port: parseInt(process.env.APP_PORT, 10) || 3003,
  cpus: parseInt(process.env.APP_CPUS, 10) || 4,
  phone: process.env.APP_MPHONE,
  mnTime: process.env.APP_MNTIME,
  url: process.env.APP_URL,
}));
