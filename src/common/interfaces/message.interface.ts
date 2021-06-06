import { MessageReturnTypes, SystemMessageTypes } from '../constants/message.constant';
import { NoteCommentTypes } from '../constants/note.constant';
import { UserClockFeels } from '../constants/user.constant';

/**
 * 基本消息定义
 */
export interface IBaseMessage {
  userId: number; //操作者ID
  type: MessageReturnTypes; //返回消息类型
}

/**
 * 收藏消息的数据定义
 */
export interface ISaveMessage extends IBaseMessage {
  psaveId?: number; //被收藏的点位收藏ID号
  sortId?: number; //被收藏的地图分类ID号
  noteId?: number; //被收藏文章ID
}

/**
 * 置顶文章的数据定义
 */
export interface ITopMessage extends IBaseMessage {
  psaveId: number; //被置顶的点位收藏ID号
  noteId: number; //被置顶文章ID
}

/**
 * 打卡消息的数据定义
 */
export interface IClockMessage extends IBaseMessage {
  feel: UserClockFeels; //打卡体验
  psaveId: number; //点位收藏ID
  noteId?: number; //对应的文章ID
}

/**
 * 评论消息的数据定义
 */
export interface ICommentMessage extends IBaseMessage {
  noteId: number; //对应的文章ID
  psaveId: number; //对应的点位收藏ID
  commentId: number; //评论ID
  cType: NoteCommentTypes; //评论类型
  isLiked: boolean; //评论是否点赞
  fatherId?: number; //一级评论ID
  upId?: number; //评论的上级评论ID
}

/**
 * 点赞消息的数据定义
 */
export interface ILikeMessage extends IBaseMessage {
  noteId: number; //对应的文章ID
  psaveId?: number; //文章对应的点位收藏ID
  commentId?: number; //评论的评论ID
}

/**
 * 系统消息的数据定义
 */
export interface ISystemMessage {
  userId: number;
  type: SystemMessageTypes;
  name?: string;
  address?: string;
  isPassed?: boolean; //是否通过
  description?: string; //说明
}
