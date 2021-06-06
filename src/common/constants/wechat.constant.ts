/**
 * 微信支付配置信息
 */
export const WxTenpay = {
  mchId: '',
  partnerKey: '',
  libzxml: ``,
};

/**
 * 用户版小程序配置信息
 */
export const WxMiniUser = {
  originId: 'gh_764c4ca051bf',
  appId: 'wx2a7fb0920a954073',
  appSecret: '',
};

/**
 * 用户版(测试版)小程序配置信息
 */
export const WxMiniUserTest = {
  originId: 'gh_633c68cc1278',
  appId: 'wx92b9f3ac8808ddfc',
  appSecret: '',
};

/**
 * 商家版小程序配置信息
 */
export const WxMiniMerchant = {
  originId: 'gh_b64c8a7c8793',
  appId: 'wxbc5b68f16ef51715',
  appSecret: '',
};

/**
 * 公众号配置信息
 */
export const WxPublicAccount = {
  originId: 'gh_a2cb2792a065',
  appId: 'wx71560054c230e77f',
  appSecret: '',
};

/**
 * 创作者中心配置信息
 */
export const WxCreatorCenter = {
  appId: 'wx77163dcccc1e87a1',
  appSecret: '',
};

/**
 * 创作者中心配置信息(测试)
 */
export const WxCreatorCenterTest = {
  appId: 'wx21b3d130d6eea817',
  appSecret: '',
};

/**
 * 定义微信应用类型
 */
export enum WechatMiniTypes {
  MERCHANT = '11', //商家版小程序
  USER = '22', //用户版小程序
  PUBLIC = '33', //公众号
  CREATOR = '44', //创作者
}

/**
 * 分享类型定义
 */
export enum WechatDataTypes {
  MAP = 'M', //分享地图
  POINT = 'P', //分享点位
  TRANSFER = 'T', //账号数据迁移
}

/**
 * 小程序码SCENE定义
 */
export const WECHAT_SCENE_ID = 'Z';

/**
 * 微信TOKEN更新提前5分钟
 */
export const WX_TOKEN_UPDATE_PREV_TIME = 300000;

/**
 * 小程序消息发送需要的TOKEN参数配置
 */
export enum WechatMinMsgTokens {
  PROD = '',
  DEV = '',
}
