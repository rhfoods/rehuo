import { registerAs } from '@nestjs/config';
import { ConfigNamespaces } from '@rehuo/common/constants/config.constant';
import dbConfig from '@rehuo/ormconfig';

/**
 * SQLDB数据库相关参数配置
 */
export default registerAs(ConfigNamespaces.SQL, () => dbConfig);
