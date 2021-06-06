/**
 * OSS操作类型定义
 */
export enum OssOperateTypes {
  DELETE = 'delete',
  READWRITE = 'readwrite',
}

/**
 * OSS操作会话类型定义
 */
export enum OssSessionNames {
  DEFAULT = 'default',
  MERCHANT = 'merchant',
}

/**
 * 开发测试环境bucket
 */
export const OssDevBucket = {
  rehuoMap: 'ukshare-s-t',
};

/**
 * 生产环境bucket
 */
export const OssProdBucket = {
  rehuoMap: 'rehuo-map',
};

/**
 * 环境配置
 */
export const OssConf = {
  endpoint: 'https://sts.aliyuncs.com',
  apiVersion: '2015-04-01',
  region: 'oss-cn-chengdu',
};

/**
 * 删除者配置(开发环境)
 */
export const OssDevDeleter = {
  accessKeyId: '',
  accessKeySecret: '',
  roleArn: '',
};

/**
 * 删除者配置(生产环境)
 */
export const OssProdDeleter = {
  accessKeyId: '',
  accessKeySecret: '',
  roleArn: '',
};

/**
 * 读写者配置(开发环境)
 */
export const OssDevReadAndWriter = {
  accessKeyId: '',
  accessKeySecret: '',
  roleArn: '',
};

/**
 * 读写者配置(生产环境)
 */
export const OssProdReadAndWriter = {
  accessKeyId: '',
  accessKeySecret: '',
  roleArn: '',
};
