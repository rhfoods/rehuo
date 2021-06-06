/**
 * 系统错误接口定义
 * @errCode: 错误代码
 * @errMsg: 错误消息
 */
export interface IError {
  errCode: number;
  errMsg: string;
}

/**
 * 可索引错误接口定义
 */
export interface IErrorArray {
  readonly [index: string]: IError;
}
