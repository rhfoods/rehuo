import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { ConfigNamespaces } from '@rehuo/common/constants/config.constant';
import { OssOperateTypes, OssSessionNames } from '@rehuo/common/constants/oss.constant';
import { SystemTaskIntervals } from '@rehuo/common/constants/system.constant';
import {
  WechatMiniTypes,
  WX_TOKEN_UPDATE_PREV_TIME,
} from '@rehuo/common/constants/wechat.constant';
import { DataSyncService } from '@rehuo/datasync/datasync.service';
import { OssService } from '@rehuo/shared/services/oss.service';
import { WechatService } from '@rehuo/shared/services/wechat.service';
import { CronJob } from 'cron';
import { IPCMsgTypes } from '../types/ipc.constant';
import { IIPCMsgReq } from '../types/ipc.interface';
import { InitService } from './init.service';
import { MasterService } from './master.service';

@Injectable()
export class TaskService {
  private wxTokenInterval;
  private stsInterval;
  private checkChildInterval;
  private oneDayTaskJob;

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly configService: ConfigService,
    private readonly wechatService: WechatService,
    private readonly ossService: OssService,
    private readonly masterService: MasterService,
    private readonly datasyncService: DataSyncService,
    private readonly initService: InitService,
  ) {
    /**
     * 定时更新微信TOKEN信息
     */
    function cbWxTokenUpdate() {
      const promises = [wechatService.accessToken(WechatMiniTypes.USER)];

      try {
        Promise.all(promises).then(([user]) => {
          const wechatConf = configService.get(ConfigNamespaces.WECHAT);
          /**
           * 上次TOKEN的超时时间和本次不一样，则重启定时器
           */
          if (wechatConf.token.user.expires_in !== user.expires_in) {
            schedulerRegistry.deleteInterval('wxToken');
            /**
             * 定时更新微信TOKEN信息
             */
            this.wxTokenInterval = setInterval(
              cbWxTokenUpdate,
              user.expires_in * 1000 - WX_TOKEN_UPDATE_PREV_TIME,
            );
            schedulerRegistry.addInterval('wxToken', this.wxTokenInterval);
          }

          wechatConf.token.user = user;

          const msg: IIPCMsgReq = {
            type: IPCMsgTypes.WX_TOKEN_ALL,
            userToken: user,
          };

          masterService.sendAll(msg);
          Logger.log('Update wechat token successfully', TaskService.name);

          return;
        });
      } catch (err) {
        console.log(err);
      }
    }

    /**
     * 定时更新STS信息
     */
    async function cbSTSUpdate() {
      try {
        const deleter = configService.get(ConfigNamespaces.OSS).deleter;
        deleter.sts = null;
        deleter.sts = await ossService.generateSTS(
          OssOperateTypes.DELETE,
          OssSessionNames.DEFAULT,
          configService.get(ConfigNamespaces.OSS).stsExpiredMaxTime,
        );
        const msg: IIPCMsgReq = {
          type: IPCMsgTypes.OSS_STS_DELETER,
          deleterSTS: deleter.sts,
        };
        masterService.sendAll(msg);
        deleter.sts
          ? Logger.log('Update alioss STS successfully', TaskService.name)
          : null;
      } catch (err) {
        console.log(err);
      }
    }

    /**
     * 定时检查子进程工作状态
     */
    async function checkChildProcess() {
      const Ids = masterService.check();
      if (Ids.length > 0) {
        Logger.log(
          `Check some child process disconnected, ID: ${Ids.join(' ')}`,
          TaskService.name,
        );
      }
      Ids.forEach(id => {
        masterService.forkOne(id);
        //更新对应的微信TOKEN和STS
        const { user, merchant, publicAccount } = configService.get(
          ConfigNamespaces.WECHAT,
        ).token;
        const { sts } = configService.get(ConfigNamespaces.OSS).deleter;
        const msgToken: IIPCMsgReq = {
          type: IPCMsgTypes.WX_TOKEN_ALL,
          merchantToken: merchant,
          userToken: user,
          publicToken: publicAccount,
        };
        const msgSts: IIPCMsgReq = {
          type: IPCMsgTypes.OSS_STS_DELETER,
          deleterSTS: sts,
        };

        masterService.send(id, msgSts);
        masterService.send(id, msgToken);
      });
    }

    /**
     * 定时上传图片到微信服务器
     */
    async function uploadMedia() {
      await initService.tempMedia();
      Logger.log('upload kefu image to wechat Servce succeed', TaskService.name);
    }

    /**
     * 缓存和数据库之间的数据同步
     */
    async function redisToDB() {
      await datasyncService.syncRedisToDB();
      Logger.log('Syncing redis data to DB', TaskService.name);
    }

    /**
     * 每天一次的定时任务
     */
    async function oneDayTasks() {
      await uploadMedia();
      await redisToDB();
      await datasyncService.flushdb();
    }

    /**
     * 启动定时更新STS
     */
    this.stsInterval = setInterval(
      cbSTSUpdate,
      configService.get(ConfigNamespaces.OSS).stsUpdatedTime,
    );
    this.schedulerRegistry.addInterval('aliSTS', this.stsInterval);

    /**
     * 初始设置更新微信TOKEN信息定时器
     */
    this.wxTokenInterval = setInterval(
      cbWxTokenUpdate,
      configService.get(ConfigNamespaces.WECHAT).tokenExpiredTime -
        WX_TOKEN_UPDATE_PREV_TIME,
    );
    this.schedulerRegistry.addInterval('wxToken', this.wxTokenInterval);

    /**
     * 启动子进程检查
     */
    this.checkChildInterval = setInterval(
      checkChildProcess,
      SystemTaskIntervals.CHILD_PROCESS_CHECK_TIME,
    );
    this.schedulerRegistry.addInterval('childProcess', this.checkChildInterval);

    /**
     * 启动缓存和数据库之间的数据同步
     */
    const times = configService.get(ConfigNamespaces.APP).mnTime.split(':');
    this.oneDayTaskJob = this.addCronJob(
      'oneDayTasks',
      oneDayTasks,
      times[0],
      times[1],
      times[2],
    );
    this.schedulerRegistry.addInterval('oneDayTasks', this.oneDayTaskJob);
  }

  /**
   * 添加一个crob任务
   */
  addCronJob(
    name: string,
    cb: () => void,
    hours: string,
    minutes: string,
    seconds?: string,
  ) {
    const cron = seconds
      ? `${seconds} ${minutes} ${hours} * * *`
      : `0 ${minutes} ${hours} * * *`;
    const job = new CronJob(cron, () => {
      cb();
    });

    this.schedulerRegistry.addCronJob(name, job);
    job.start();

    return job;
  }
}
