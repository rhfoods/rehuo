export enum MapShowScales {
  CITY_POINT_DIV_NORMAL = 9,
  CITY_POINT_DIV_CHONGQING = 6,
}

/**
 * 地图点位关键阈值
 */
export enum MapPointCounts {
  //一次获取最多的点位数值
  MAX_ONETAKE = 200,
  /**
   * 如果城市点位数量超过此值，则开启区县显示功能
   */
  MAX_INCITY = 200,
}

/**
 * 地图显示区域的类型
 */
export enum MapScopeTypes {
  CITYS = 'CI', //各市地图
  POINTS = 'PO', //点位信息
}

/**
 * 地图显示区域的类型
 */
export enum MapAreaTypes {
  CITYS = 'CI', //主要城市地图
}

/**
 * 公共地图用户ID
 */
export const PUBLIC_MAP_USER_ID = 0;
