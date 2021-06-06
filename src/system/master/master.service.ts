import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigNamespaces } from '@rehuo/common/constants/config.constant';
import { PROJECT_NAME } from '@rehuo/common/constants/system.constant';
import { ChildProcess, fork } from 'child_process';
import * as _path from 'path';
import { IIPCMsgReq } from '../types/ipc.interface';

@Injectable()
export class MasterService {
  private readonly childs: ChildProcess[];
  private readonly logger: Logger;

  constructor(private readonly configService: ConfigService) {
    this.childs = [];
    this.logger = new Logger(MasterService.name);
    process.title = `${PROJECT_NAME}: master process`;

    this.listen();
    this.fork();
  }

  /**
   * 监听子进程事件
   */
  listenChild(child: ChildProcess, id?: number) {
    const name = `${PROJECT_NAME}: worker process ${id}`;

    child.on('message', (msg: IIPCMsgReq) => {
      this.logger.log(`receive ${name} message: ${JSON.stringify(msg)}`);
      this.sendAll(msg);
      return;
    });

    child.on('error', err => {
      this.logger.error(`receive ${name} error: ${err}`);
    });

    child.on('close', code => {
      this.logger.warn(`${name} close with code ${code}`);
    });
  }

  /**
   * 运行主进程
   */
  fork() {
    const cpus = Number(this.configService.get(ConfigNamespaces.APP).cpus);

    //创建工作进程
    for (let i = 0; i < cpus; i++) {
      const child = fork(_path.join(__dirname, '/../worker/worker'), [], {
        env: { id: `${i}` },
      });
      this.listenChild(child, i);
      this.childs.push(child);
    }
  }

  /**
   * 给子进程发送消息
   * @param id 子进程内部ID号
   * @param msg 消息
   */
  send(id: number, msg: IIPCMsgReq) {
    if (!this.childs[id].send(msg)) {
      this.logger.error(`send msg failed, worker process ${id}`);
    }
  }

  /**
   * 给所有子进程发送消息
   * @param msg 消息
   */
  sendAll(msg: IIPCMsgReq) {
    this.childs.forEach((child, index) => {
      if (!child.send(msg)) {
        this.logger.error(`send msg failed, worker process ${index}`);
      }
    });
  }

  recv() {
    return;
  }

  /**
   * 检查所有子进程是否正常
   */
  check(): number[] {
    const Ids = [];
    this.childs.forEach((child, index) => {
      if (!child.connected) {
        Ids.push(index);
      }
    });
    return Ids;
  }

  /**
   * 创建子进程
   * @param {number} id
   */
  forkOne(id: number) {
    const childPrcoess = fork(_path.join(__dirname, '/../worker/worker'), [], {
      env: { id: `${id}` },
    });
    this.childs.splice(id, 1, childPrcoess);
  }

  /**
   * 停止子进程
   * @param {number} id 进程ID
   */
  kill(id: number) {
    this.childs[id].kill('SIGSTOP');
  }

  /**
   * 结束工作进程
   */
  stop() {
    this.childs.forEach((child, index) => {
      const name =
        index === 0
          ? `${PROJECT_NAME}: master process`
          : `${PROJECT_NAME}: worker process ${index}`;

      if (child.kill()) {
        this.logger.log(`Stop ${name} succeed`);
      } else {
        this.logger.error(`Stop ${name} failed`);
      }
    });
  }

  /**
   * 监听子进程发送信息和系统信号
   */
  listen() {
    process.on('exit', () => {
      this.stop();
      return;
    });

    process.on('SIGINT', () => {
      process.exit();
    });
  }
}
