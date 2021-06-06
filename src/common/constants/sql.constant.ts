/**
 *  SQL排序类型定义
 */
export enum SqlOrderTypes {
  ASC = 'ASC', //升序
  DESC = 'DESC', //降序
}

/**
 * 数据库表列表
 */
export enum DBNAME {
  MAP_POINTS = 'map_points', //点位信息表
  MAP_SAVES = 'map_saves', //地图收藏表
  MAP_SHARES = 'map_shares', //分享信息表
  POINT_SAVES = 'point_saves', //点位收藏表
  POINT_SORTS = 'point_sorts', //点位分类表
  POINT_SAVE_STATS = 'psave_stats', //点位收藏数据表
  POINT_STATS = 'point_stats', //点位数据表

  POINT_NOTES = 'point_notes', //点位文章表
  NOTE_STATS = 'note_stats', //文章数据表
  NOTE_LIKES = 'note_likes', //文章点赞表
  NOTE_SAVES = 'note_saves', //文章收藏表
  NOTE_MASKS = 'note_masks', //文章屏蔽表
  NOTE_COMMENTS = 'note_comments', //文章评论表
  COMMENT_LIKES = 'comment_likes', //评论点赞表

  USERS = 'users', //用户表
  USER_STATS = 'user_stats', //用户数据表
  USER_CLOCKS = 'user_clocks', //用户打卡信息表
  USER_LINKS = 'user_links', //用户打卡信息表

  HINT_USERS = 'hint_users', //用户消息表

  MESSAGES = 'messages', //系统消息表
  AUDITORS = 'auditors', //审核人员信息表

  PROVINCE_POINTS = 'province_points', //省会点位统计表
  CITY_POINTS = 'city_points', //主要城市点位统计表
  COUNTRY_POINTS = 'country_points', //主要城市点位统计表
  POINT_RECOMMENDS = 'point_recommends', //推荐门店信息表
  PUBLIC_CITYS = 'public_citys', //公共地图的城市

  USER_RECOMMENDS = 'user_recommends', //用户推荐表
  USER_PUBLICS = 'user_publics', //公共地图和个人地图的映射数据库表
}
