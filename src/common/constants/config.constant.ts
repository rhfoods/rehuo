/**
 * ConfigModule配置参数命名
 */
export enum ConfigNamespaces {
  APP = 'app', //系统运行配置参数命名
  SQL = 'sql', //关系型数据库配置参数命名
  NOSQL = 'nosql', //非关系型数据库配置参数命名
  REDIS = 'redis', //缓存配置参数命名
  JWT = 'jwt', //jsonwebtoken配置参数命名
  OSS = 'oss', //oss存储配置参数命名,
  WECHAT = 'wx', //微信配置参数命名
  SMS = 'sms', //短信验证参数命名
}
