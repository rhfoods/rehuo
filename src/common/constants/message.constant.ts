/**
 * 查询消息类型定义
 */
export enum MessageQueryTypes {
  SAVETOP = 'ST', //收藏与置顶
  CLOCK = 'CL', //打卡
  LIKE = 'LI', //点赞
  COMMENT = 'CO', //评论
  SYSTEM = 'SY', //系统消息
}

/**
 * 返回消息类型定义
 */
export enum MessageReturnTypes {
  SAVE_POINT = 'SP', //收藏没有发现的点位
  SAVE_MAP = 'SM', //收藏地图
  SAVE_NOTE = 'SN', //收藏发现
  SET_TOP = 'ST', //置顶文章
  CLOCK_POINT = 'CP', //打卡没有发现的点位
  CLOCK_NOTE = 'CN', //打卡有发现的点位
  COMMENT_NOTE = 'CO', //评论文章
  COMMENT_COMMENT = 'CC', //评论评论
  LIKE_NOTE = 'LN', //点赞发现
  LIKE_COMMENT = 'LC', //点赞评论
  SYSTEM = 'SY', //系统消息
}

/**
 * 系统消息类型定义
 */
export enum SystemMessageTypes {
  POINT_RECOMMENDS = 'PR',
  POINT_RECOMMEND_USERS = 'RU',
  FIRST_LOGINNED = 'FL'
}
