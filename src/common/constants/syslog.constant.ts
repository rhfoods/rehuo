/**
 * 系统日志类型
 */
export enum SyslogTypes {
  USER = 'UR', //用户
  AUTH = 'AU', //登录认证
  DB = 'DB', //数据库
}

/**
 * 系统日志内容信息
 */
export enum SyslogContents {
  USER_EXIST = '用户已经存在',
}
