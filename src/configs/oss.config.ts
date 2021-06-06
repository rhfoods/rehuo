import { registerAs } from '@nestjs/config';
import { ConfigNamespaces } from '@rehuo/common/constants/config.constant';
import {
  OssConf,
  OssDevBucket,
  OssDevDeleter,
  OssDevReadAndWriter,
  OssProdBucket,
  OssProdDeleter,
  OssProdReadAndWriter,
} from '@rehuo/common/constants/oss.constant';
import { SystemEnvironments } from '@rehuo/common/constants/system.constant';

/**
 * OSS相关运行参数配置
 */
export default registerAs(ConfigNamespaces.OSS, () => {
  let bucket, deleter, readAndWriter;

  if (process.env.APP_ENV === SystemEnvironments.PROD) {
    bucket = OssProdBucket;
    deleter = OssProdDeleter;
    readAndWriter = OssProdReadAndWriter;
  } else {
    bucket = OssDevBucket;
    deleter = OssDevDeleter;
    readAndWriter = OssDevReadAndWriter;
  }
  return {
    ...OssConf,
    ...bucket,
    stsExpiredTime: process.env.OSS_STS_EXPIRED_TIME,
    stsUpdatedTime: process.env.OSS_STS_UPDATED_TIME,
    stsExpiredMaxTime: process.env.OSS_EXPIRED_MAXTIME,
    deleter: {
      ...deleter,
      sts: null,
    },
    readAndWriter: {
      ...readAndWriter,
      sts: null,
    },
  };
});
