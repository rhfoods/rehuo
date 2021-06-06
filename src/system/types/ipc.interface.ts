import { IPCMsgTypes } from './ipc.constant';

/**
 * 主进程与子进程之间的IPC通信请求
 */
export interface IIPCMsgReq {
  type: IPCMsgTypes;
  userToken?: any;
  merchantToken?: any;
  publicToken?: any;
  deleterSTS?: any;
  mediaId?: string;
}
