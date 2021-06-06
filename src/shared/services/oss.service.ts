import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigNamespaces } from '@rehuo/common/constants/config.constant';
import { OssOperateTypes, OssSessionNames } from '@rehuo/common/constants/oss.constant';
import * as OSS from 'ali-oss';
import RPCClient = require('@alicloud/pop-core');

@Injectable()
export class OssService {
  private deleter;
  private readAndWriter;
  private logger: Logger;

  constructor(private readonly configService: ConfigService) {
    this.deleter = new RPCClient({
      ...configService.get(ConfigNamespaces.OSS).deleter,
      endpoint: configService.get(ConfigNamespaces.OSS).endpoint,
      apiVersion: configService.get(ConfigNamespaces.OSS).apiVersion,
    });

    this.readAndWriter = new RPCClient({
      ...configService.get(ConfigNamespaces.OSS).readAndWriter,
      endpoint: configService.get(ConfigNamespaces.OSS).endpoint,
      apiVersion: configService.get(ConfigNamespaces.OSS).apiVersion,
    });

    this.logger = new Logger();
    this.logger.setContext(OssService.name);
  }

  /**
   * 生成OSS的STS访问令牌
   * @param {OssOperateTypes} ossType OSS操作类型，包括删除和读写操作
   * @param {OssSessionNames} sessionName OSS会话名称
   * @param {number} [ossExpiredTime] STS的过期时间，单位为秒
   */
  async generateSTS(
    ossType: OssOperateTypes,
    sessionName: OssSessionNames,
    ossExpiredTime?: number,
  ) {
    const params: any = {};
    let handler: any;

    switch (ossType) {
      case OssOperateTypes.DELETE:
        params.RoleArn = this.configService.get(ConfigNamespaces.OSS).deleter.roleArn;
        handler = this.deleter;
        break;
      case OssOperateTypes.READWRITE:
        params.RoleArn = this.configService.get(
          ConfigNamespaces.OSS,
        ).readAndWriter.roleArn;
        handler = this.readAndWriter;
        break;
    }
    params.RoleSessionName = sessionName;
    params.DurationSeconds = ossExpiredTime
      ? ossExpiredTime
      : this.configService.get(ConfigNamespaces.OSS).stsExpiredTime;

    try {
      const result = await handler.request('AssumeRole', params);
      return result.Credentials;
    } catch (err) {
      this.logger.error(err.message);
      throw new ServiceUnavailableException(err);
    }
  }

  /**
   * 删除OSS上面的多张图片
   * @param {string[]} medias 点位媒体信息列表
   */
  async deleteMedias(medias: string[]) {
    if (medias.length === 0) {
      return;
    }

    const ossConf = this.configService.get(ConfigNamespaces.OSS);

    let STS = ossConf.deleter.sts;
    if (!STS) {
      STS = await this.generateSTS(
        OssOperateTypes.DELETE,
        OssSessionNames.DEFAULT,
        this.configService.get(ConfigNamespaces.OSS).stsExpiredTime,
      );
      ossConf.deleter.sts = STS;
    }
    const stsConf = {
      region: ossConf.region,
      accessKeyId: STS.AccessKeyId,
      accessKeySecret: STS.AccessKeySecret,
      stsToken: STS.SecurityToken,
      bucket: ossConf.rehuoMap,
    };

    const oss = new OSS(stsConf);
    if (medias.length <= 1) {
      oss.delete(medias[0]);
    } else {
      oss.deleteMulti(medias);
    }
  }
}
