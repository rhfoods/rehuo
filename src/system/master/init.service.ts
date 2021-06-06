import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection } from '@nestjs/typeorm';
import { AuditorService } from '@rehuo/auditor/auditor.service';
import { ConfigNamespaces } from '@rehuo/common/constants/config.constant';
import { OssOperateTypes, OssSessionNames } from '@rehuo/common/constants/oss.constant';
import { DBNAME } from '@rehuo/common/constants/sql.constant';
import { SystemConstants } from '@rehuo/common/constants/system.constant';
import { WechatMiniTypes } from '@rehuo/common/constants/wechat.constant';
import { OssService } from '@rehuo/shared/services/oss.service';
import { WechatService } from '@rehuo/shared/services/wechat.service';
import { Connection, Table } from 'typeorm';
import { IPCMsgTypes } from '../types/ipc.constant';
import { IIPCMsgReq } from '../types/ipc.interface';
import { MasterService } from './master.service';
/**
 * 系统初始化服务类
 */
@Injectable()
export class InitService {
  constructor(
    private readonly configService: ConfigService,
    private readonly masterService: MasterService,
    private readonly ossService: OssService,
    private readonly wechatService: WechatService,
    private readonly auditorService: AuditorService,
    @InjectConnection()
    private connection: Connection,
  ) {}

  /**
   * 获取微信TOKEN信息，并保存到缓存中
   */
  async wxToken(): Promise<any> {
    const promises = [this.wechatService.accessToken(WechatMiniTypes.USER)];

    Promise.all(promises).then(([user]) => {
      const msg: IIPCMsgReq = {
        type: IPCMsgTypes.WX_TOKEN_ALL,
        userToken: user,
      };
      this.masterService.sendAll(msg);

      const wechatConf = this.configService.get(ConfigNamespaces.WECHAT);
      wechatConf.token = {
        user,
      };
      Logger.log('Get wechat token successfully', InitService.name);
      return;
    });
  }

  /**
   * 获取alioss STS信息，并保存到缓存中
   */
  async aliSTS(): Promise<any> {
    const deleter = this.configService.get(ConfigNamespaces.OSS).deleter;
    deleter.sts = await this.ossService.generateSTS(
      OssOperateTypes.DELETE,
      OssSessionNames.DEFAULT,
      this.configService.get(ConfigNamespaces.OSS).stsExpiredMaxTime,
    );
    const msg: IIPCMsgReq = {
      type: IPCMsgTypes.OSS_STS_DELETER,
      deleterSTS: deleter.sts,
    };
    this.masterService.sendAll(msg);

    deleter.sts ? Logger.log('Get alioss STS successfully', InitService.name) : null;
  }

  /**
   * 创建审核员
   */
  async auditor(): Promise<any> {
    await this.connection.createQueryRunner().createTable(
      new Table({
        name: DBNAME.AUDITORS,
        columns: [
          {
            name: 'auditor_id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'created_at',
            type: 'datetime',
            isNullable: false,
            default: 'NOW()',
          },
          {
            name: 'updated_at',
            type: 'datetime',
            isNullable: true,
            default: 'NOW()',
          },
          {
            name: 'account',
            type: 'varchar',
            isUnique: true,
            length: String(SystemConstants.LITTLE_LENGTH),
            comment: '账号名称',
          },
          {
            name: 'password',
            type: 'varchar',
            comment: '账号名称',
          },
          {
            name: 'name',
            type: 'varchar',
            length: String(SystemConstants.LITTLE_LENGTH),
            comment: '名称',
            charset: 'utf8mb4',
          },
        ],
      }),
      true,
    );

    let auditor = await this.auditorService.findOneNotException({
      account: 'createkn',
    });

    if (!auditor) {
      auditor = await this.auditorService.createOne({
        account: 'createkn',
        name: '零号审核员',
        password: 'Abcd@123456',
      });
      auditor
        ? Logger.log('Create system content auditor succeed', InitService.name)
        : null;
    }
  }

  /**
   * 把客服图片上传微信服务器
   */
  async tempMedia(): Promise<any> {
    const file = __dirname + '/../../../static/kefu.jpg';
    const mediaId = await this.wechatService.uploadTempMedia(WechatMiniTypes.USER, file);
    const wxConf = this.configService.get(ConfigNamespaces.WECHAT);

    if (mediaId) {
      wxConf.mediaIds = {
        kefu: mediaId,
      };
    }
    const msg: IIPCMsgReq = {
      type: IPCMsgTypes.WX_MEDIA_KEFU,
      mediaId,
    };
    this.masterService.sendAll(msg);
  }
}
