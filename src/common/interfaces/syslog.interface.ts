import { SyslogTypes } from '../constants/syslog.constant';

/**
 * 用户日志数据格式定义
 */
export interface IUserSyslog {
  id?: number | string;
  openId?: string;
  ctx: string;
}

/**
 * 系统日志数据格式定义
 */
export interface ISyslog {
  type: SyslogTypes;
  data: IUserSyslog; //日志内容
}
