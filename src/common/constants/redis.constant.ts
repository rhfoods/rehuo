/**
 * REDIS超时时间定义
 */
export enum RedisTimeouts {
  DEFAULT_TIMEOUT = 30,
  USER_LOGINED = 3600,
  AUDITOR_LOGINED = 3600,
  USER_INFO = 3600,
  POINT_NOTE = 3600,
  POINT_SAVE = 120,
  QRCODE_TRANSFER = 86400,
  TRANSFER_PHONE = 600,
  SOMECACHE_STATS = 259200,
  PUBLIC_MAP = 3600,
  HINT_USER = 86400,
}

/**
 * redis存储的键值命名定义
 */
export enum RedisNames {
  USER_ADD_POINT_LOCKED = 'user:add:point:locked:%s',
  USER_CREATE_LOCKED = 'user:create:locked:%s',
  USER_UPDATE_TOKEN_LOCKED = 'user:update:token:locked:%s',
  USER_ADD_NOTE_LOCKED = 'user:add:note:locked:%s:%s',
  USER_SAVE_POINT_LOCKED = 'user:save:point:locked:%s:%s',
  USER_ADD_SORT_LOCKED = 'user:add:sort:locked:%s',
  USER_ADD_MAP_LOCKED = 'user:add:map:locked:%s:%s',
  USER_ADD_MEDIA_LOCKED = 'user:add:media:locked:%s',
  USER_MESSAGE_LOCKED = 'user:msg:locked:%s',
  USER_CLOCK_LOCKED = 'user:clock:locked:%s:%s',
  NOTE_LIKE_LOCKED = 'note:like:locked:%s:%s',
  NOTE_AUDIT_LOCKED = 'note:audit:locked:%s',
  NOTE_SAVE_LOCKED = 'note:save:locked:%s:%s',
  MAP_SHARE_LOCKED = 'map:share:locked:%s:%s',
  TRANSFER_LOCKED = 'transfer:locked:%s',
  NOTE_COMMENT_LOCKED = 'note:comment:locked:%s:%s',
  NOTE_COMMENT_LIKE_LOCKED = 'note:comment:like:locked:%s:%s',
  POINT_RECOMMEND_LOCKED = 'point:recommend:locked:%s',
  POINT_RECOMMEND_AUDIT_LOCKED = 'point:recommend:audit:locked:%s',

  HINT_CHANGED = 'hint:changed:s',
  USER_LOGINED = 'user:logined:%s',
  AUDITOR_LOGINED = 'auditor:logined:%s',

  HINT_USER = 'hint:user:%s',
  USER_INFO = 'user:info:%s',
  POINT_NOTE = 'point:note:%s',
  POINT_SAVE = 'point:save:%s',

  NOTE_STAT_CHANGED = 'note:changed:s',
  NOTE_STATS = 'note:stat:%s',

  USER_STAT_CHANGED = 'user:changed:s',
  USER_STATS = 'user:stat:%s',

  COMMENT_STAT_CHANGED = 'comment:changed:s',
  COMMENT_STATS = 'comment:stat:%s',

  QRCODE_TRANSFER = 'qrcode:transfer:%s',
  TRANSFER_PHONE = 'transfer:phone:%s:%s',

  PUBLIC_CITYS = 'public:citys',
  PUBLIC_CITY_SORTS = 'public:city:sorts:%s',
  PUBLIC_CITY_SORT_POINTS = 'public:city:sort:points:%s:%s',
}

/**
 * 用户提示消息缓存标记
 */
export enum HintUserFields {
  SAVETOPS = 'savetops',
  CLOCKS = 'clocks',
  LIKES = 'likes',
  COMMENTS = 'comments',
  SYSTEMS = 'systems',
}

/**
 * 从集合中一次获取元素的长度
 */
export const REDIS_ONE_TAKE_COUNT = 100;

/**
 * 用户状态数据
 */
export enum UserStatFields {
  NOTE_VIEWS = 'noteViews',
  NOTE_LIKES = 'noteLikes',
  MAP_SHARES = 'mapShares',
  NOTE_TOPS = 'noteTops',
}

/**
 * 文章状态数据
 */
export enum NoteStatFields {
  VIEWS = 'views',
  TOPS = 'tops',
  LIKES = 'likes',
  SHARES = 'shares',
  COMMENTS = 'comments',
}

/**
 * 评论状态数据
 */
export enum NoteCommentFields {
  LIKES = 'likes',
}
