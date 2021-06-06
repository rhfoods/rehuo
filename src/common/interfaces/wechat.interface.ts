import { WechatDataTypes, WechatMiniTypes } from '../constants/wechat.constant';

/**
 * 微信请求数据定义
 */
export interface IWechatLoginReq {
  code: string;
  nickName?: string;
  avatarUrl?: string;
  encryptedData?: string;
  iv?: string;
}

/**
 * 微信返回数据定义
 */
export interface IWechatOpenId {
  openId: string;
  unionId?: string;
}

/**
 * 分享数据格式定义
 */
export interface IWechatShareData {
  id: number;
  commonId: number;
  topNoteId?: number;
  cityCode?: string;
}

/**
 * 迁移数据格式定义
 */
export interface IWechatTransferData {
  phone: string;
  userId: number;
}

/**
 * 分享小程序码数据定义
 */
export interface IWechatDataReq {
  type: WechatDataTypes;
  share?: IWechatShareData;
  transfer?: IWechatTransferData;
}

/**
 * 生成小程序码请求定义
 */
export interface IWechatCodeReq {
  code: WechatMiniTypes; //小程序类型
  scene: IWechatDataReq; //小程序码请求数据
  page?: string; //跳转主页
  width?: number; //小程序码宽度
  autoColor?: boolean; //是否自动调色
  lineColor?: {
    r: string;
    g: string;
    b: string;
  }; //autoColor为false时生效，使用rgb设置颜色例如{"r":"xxx","g":"xxx","b":"xxx"}十进制表示
  isHyaline?: boolean; //是否需要透明底色，为 true 时，生成透明底色的小程序
}

/**
 * 微信安全审查请求
 */
export interface IWechatSecReq {
  code: WechatMiniTypes; //小程序类型
  content: string; //安全审查的文字内容
}
