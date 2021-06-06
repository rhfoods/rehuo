import * as Joi from '@hapi/joi';
import {
  PROJECT_NAME,
  SystemEnvironments,
} from '@rehuo/common/constants/system.constant';

/**
 * access token最长不超过23小时
 * refresh token最长不超过30天
 */
const accessTokenRegExp = '^([1-9]|[1][0-9]|[2][0-3])m|h$';
const refreshTokenRegExp = '^([1-9]|[1][0-9]|[2][0-9]|30)m|h|d$';

/**
 * 验证system.env文件中所有的运行配置参数
 */
export const validationSchema = Joi.object({
  //程序环境运行参数检查
  APP_ENV: Joi.string()
    .valid(...Object.values(SystemEnvironments))
    .default('prod'),
  APP_PORT: Joi.string().default('3003'),
  APP_CPUS: Joi.number()
    .min(1)
    .default(4),
  APP_URL: Joi.string().uri(),

  //SQLDB系统配置参数检查
  SQLDB_TYPE: Joi.string().default('mysql'),
  SQLDB_HOST: Joi.string().default('localhost'),
  SQLDB_PORT: Joi.string().default('3306'),
  SQLDB_USERNAME: Joi.string().required(),
  SQLDB_PASSWORD: Joi.string()
    .pattern(new RegExp('^[a-zA-Z0-9]{6,30}$'))
    .required(),
  SQLDB_DATABASE: Joi.string()
    .required()
    .default(`${PROJECT_NAME}`),

  //JWT配置参数检查
  JWT_MERCHANT_ACCESS_TOKEN: Joi.string()
    .pattern(new RegExp(accessTokenRegExp))
    .required(),
  JWT_MERCHANT_REFRESH_TOKEN: Joi.string()
    .pattern(new RegExp(refreshTokenRegExp))
    .required(),
  JWT_USER_ACCESS_TOKEN: Joi.string()
    .pattern(new RegExp(accessTokenRegExp))
    .required(),
  JWT_AUDITOR_ACCESS_TOKEN: Joi.string()
    .pattern(new RegExp(accessTokenRegExp))
    .required(),
  JWT_AUDITOR_REFRESH_TOKEN: Joi.string()
    .pattern(new RegExp(refreshTokenRegExp))
    .required(),

  //REDIS运行参数检查
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.string().default('6379'),

  //OSS运行参数检查
  //STS过期默认时间，不能超过1小时，否则系统会报错(单位/s)
  OSS_STS_EXPIRED_TIME: Joi.number()
    .min(900)
    .max(3600)
    .default(900),
  //STS定时更新时间(单位/ms)
  OSS_STS_UPDATED_TIME: Joi.number()
    .max(3300000)
    .default(3300000),
  //签名有效时间为30分钟(单位/s)
  OSS_SIGN_EXPIRED_TIME: Joi.number()
    .max(1800)
    .default(1800),

  //微信运行参数检查
  //TOKEN过期默认时间，不能超过2小时
  WX_TOKEN_EXPIRED_TIME: Joi.number()
    .max(7200000)
    .default(7200000),

  //SMS配置参数检查，短信最短过期时间不能低于1分钟
  SMS_EXPIRED_TIME: Joi.number()
    .min(60)
    .default(600)
    .required(),
});
