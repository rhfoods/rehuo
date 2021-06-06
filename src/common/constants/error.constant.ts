import { IErrorArray } from '../interfaces/error.interface';

export const ERRORS: IErrorArray = {
  /**
   * 系统相关错误
   */
  INTERNAL_SERVER_ERROR: {
    errCode: 30000,
    errMsg: '系统繁忙中，请稍后再试',
  },
  ENVIRONMENT_NOTMATCHED: {
    errCode: 30001,
    errMsg: '令牌请求与运行环境不一致',
  },
  TOKEN_INVALID: {
    errCode: 30002,
    errMsg: '令牌无效',
  },
  RESOURCE_NOTFINDED: {
    errCode: 30003,
    errMsg: '请求的资源不存在',
  },
  RESOUCE_ROLE_INVALID: {
    errCode: 30004,
    errMsg: '资源访问权限无效',
  },
  PARAMS_INVALID: {
    errCode: 30005,
    errMsg: '错误的输入参数',
  },
  TOKEN_EXPIRED: {
    errCode: 30006,
    errMsg: '令牌过期',
  },
  RESOURCE_DUP: {
    errCode: 30007,
    errMsg: '资源重复',
  },
  TOKEN_ROLE_INVALID: {
    errCode: 30009,
    errMsg: '令牌访问权限无效',
  },
  RESOURCE_EXIST: {
    errCode: 30010,
    errMsg: '资源存在',
  },
  TRANSFER_EXCEPTION: {
    errCode: 30011,
    errMsg: '数据迁移过程中发生错误，请联系客服人员',
  },
  USER_LACK_UNIONID: {
    errCode: 30012,
    errMsg: '缺少unionId，请重新LOGIN',
  },

  /**
   * 微信服务相关错误
   */
  WECHAT_REQUEST: {
    errCode: 31001,
    errMsg: '微信服务请求出现错误',
  },
  WECHAT_REQUEST_OPENID: {
    errCode: 31002,
    errMsg: '微信服务请求获取的OPENID错误',
  },
  WECHAT_REQUEST_CODE: {
    errCode: 31003,
    errMsg: '微信二维码请求数据错误',
  },
  WECHAT_SEC_CHECK: {
    errCode: 31004,
    errMsg: '您发表的内容中存在违规，请重新填写~~',
  },
  LBS_POI: {
    errCode: 31005,
    errMsg: '获取坐标位置详情发生错误',
  },
  LBS_OUTOFREACH: {
    errCode: 31006,
    errMsg: '目前暂不支持创建国外点位，请重新选择~~',
  },

  /**
   * 点位相关错误
   */
  MAPPOINT_DONT_CHANGED: {
    errCode: 32001,
    errMsg: '仅点位创建者才能够修改点位',
  },
  MAPPOINT_DUP: {
    errCode: 32002,
    errMsg: '您已创建了这个点，不要重复创建哟~~',
  },
  POINTSAVE_DUP: {
    errCode: 32003,
    errMsg: '您已收藏这里，不能重复收藏哟~~',
  },
  POINT_NOTE_DUP: {
    errCode: 32005,
    errMsg: '您已在这里发布过内容哟~~',
  },
  NOTE_LIKE_DUP: {
    errCode: 32006,
    errMsg: '您已赞过~~',
  },
  MAPSAVE_DUP: {
    errCode: 32007,
    errMsg: '您已收藏这张地图，不能重复收藏哟~~',
  },
  POINTSORT_DUP: {
    errCode: 32008,
    errMsg: '您已创建过这个分类，不能重复创建哟~~',
  },
  NOTESAVE_DUP: {
    errCode: 32009,
    errMsg: '您已收藏了这篇文章~~',
  },
  POINTNOTE_NOEXIST: {
    errCode: 32010,
    errMsg: '该文章已被作者删除了~~',
  },

  /**
   * 数据迁移相关错误
   */
  TRANSFER_EXPIRED: {
    errCode: 32101,
    errMsg: '此次操作已过期，请让对方重新生成二维码~~',
  },
  TRANSFER_PHONE_INVALID: {
    errCode: 32102,
    errMsg: '进行迁移的手机号码不正确，请重新确认~~',
  },
  TRANSFER_WXCODE_INVALID: {
    errCode: 32103,
    errMsg: '该小程序码已失效~~',
  },
  TRANSFER_USER_DEFAULTCSS: {
    errCode: 32104,
    errMsg: '发现有点位没有设置分类，请先处理~~',
  },
  TRANSFER_POINT_CITY_DONTMATCHED: {
    errCode: 32105,
    errMsg: '发现有点位不属于迁移的目的城市，请先处理~~',
  },
  TRANSFER_POINT_SAME: {
    errCode: 32106,
    errMsg: '发现迁移对方已经有相同的点位了，请先处理~~',
  },
  TRANSFER_HAVE_SAVEFINDS: {
    errCode: 32107,
    errMsg: '发现有点位不是自己创建的点位，请先处理~~',
  },
  TRANSFER_POINT_NOTNOTES: {
    errCode: 32108,
    errMsg: '发现有点位没有文章，请先处理~~',
  },

  /**
   * 审核者相关错误
   */
  AUDITOR_PASSWORD: {
    errCode: 33001,
    errMsg: '审核者登录口令不正确',
  },
  AUDITOR_REASON_NOEXIST: {
    errCode: 33002,
    errMsg: '请填写审核未通过的原因',
  },

  /**
   * 第三方服务相关错误
   */
  SMS_SEND: {
    errCode: 34001,
    errMsg: '短信验证码发送失败',
  },
  SMS_SEND_TOOMUCH: {
    errCode: 34002,
    errMsg: '短信验证码发送过于频繁，请稍后再试',
  },
  SMS_VERIFY: {
    errCode: 34003,
    errMsg: '短信验证码不正确',
  },
  SMS_EXPIRED: {
    errCode: 34004,
    errMsg: '短信验证码已过期,请重新获取',
  },

  /**
   * 创作者相关错误
   */
  CREATOR_USER_NOEXIST: {
    errCode: 35001,
    errMsg: '没找到您的个人信息，请先使用热活美食地图小程序',
  },
};
