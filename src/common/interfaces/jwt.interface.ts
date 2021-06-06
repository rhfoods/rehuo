import { ShopRoles } from '../constants/shop.constant';
import {
  JwtTypes,
  SystemEnvironments,
  SystemRoleTypes,
} from '../constants/system.constant';

/**
 * JWT超时时间设置
 */
export interface IJwtExpire {
  accessTime: number | string;
  refreshTime: number | string;
}

/**
 * JWT令牌基本数据定义
 */
export interface IBaseToken {
  rl: SystemRoleTypes; //角色名称
  id: number; //角色对应人员的ID号
  en: SystemEnvironments; //运行环境
  tk?: JwtTypes; //令牌角色，包括refresh和access两种
}

/**
 * 用户token定义
 */
export type IUserToken = IBaseToken;

/**
 * 商家token定义
 */
export interface IMerchantToken extends IBaseToken {
  sr: ShopRoles; //点位管理人员角色
}

/**
 * 审核者TOKEN定义
 */
export interface IAuditorToken extends IBaseToken {
  sr: ShopRoles; //点位管理人员角色
}

export type IToken = IUserToken | IMerchantToken | IAuditorToken;
