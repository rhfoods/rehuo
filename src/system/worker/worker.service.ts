import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigNamespaces } from '@rehuo/common/constants/config.constant';
import { IPCMsgTypes } from '../types/ipc.constant';
import { IIPCMsgReq } from '../types/ipc.interface';

@Injectable()
export class WorkerService {
  constructor(private readonly configService: ConfigService) {
    this.listen();
  }

  /**
   * 监听主进程发送的信息
   */
  async listen() {
    process.on('message', (msg: IIPCMsgReq) => {
      const wxConf: any = this.configService.get(ConfigNamespaces.WECHAT);
      const deleter = this.configService.get(ConfigNamespaces.OSS).deleter;
      switch (msg.type) {
        case IPCMsgTypes.WX_TOKEN_ALL:
          wxConf.token = {
            user: msg.userToken,
          };
          break;
        case IPCMsgTypes.WX_TOKEN_MERCHANT:
          wxConf.token = {
            merchant: msg.merchantToken,
          };
          break;
        case IPCMsgTypes.WX_TOKEN_USER:
          wxConf.token = {
            user: msg.userToken,
          };
          break;
        case IPCMsgTypes.WX_TOKEN_PUBLIC:
          wxConf.token = {
            publicAccount: msg.publicToken,
          };
          break;
        case IPCMsgTypes.OSS_STS_DELETER:
          deleter.sts = msg.deleterSTS;
          break;
        case IPCMsgTypes.WX_MEDIA_KEFU:
          wxConf.mediaIds.kefu = msg.mediaId;
          break;
        default:
          break;
      }
    });
  }
}
