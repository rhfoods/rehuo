/**
 * 点位字段长度定义
 */
export enum MapPointFieldLengths {
  TAG = 10, //点位标记长度
  NOTE_TITLE = 20, //文章标题长度
  NOTE_CONTENT = 2000, //文章内容长度
  RECOMMEND_REASON = 200, //推荐理由
}

/**
 * 点位所属关系类型定义
 */
export enum PointOwnTypes {
  MY_CREATE = 'C', //自己创建的
  SAVE_FIND = 'F', //收藏别人，并写了文章
  ONLY_SAVE = 'S', //仅收藏
  NOT_SAVE = 'N', //未收藏
}

/**
 * 分享类型定义
 */
export enum MapShareTypes {
  MAP = 'M', //分享地图
  POINT = 'P', //分享点位
  NOTE = 'N', //分享文章
}
