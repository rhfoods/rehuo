import { number } from '@hapi/joi';
import { ApiProperty } from '@nestjs/swagger';
import { MessageReturnTypes } from '@rehuo/common/constants/message.constant';
import { NoteCommentTypes } from '@rehuo/common/constants/note.constant';
import { UserClockFeels } from '@rehuo/common/constants/user.constant';
import { PageResponseDTO } from '@rehuo/common/dtos/page.response.dto';
import { Exclude, Expose } from 'class-transformer';

/**
 * 返回消息信息
 */
@Exclude()
export class MessageInternalDTO {
  @Expose()
  @ApiProperty({
    type: Number,
    description: '消息ID号',
  })
  msgId: number;

  @Expose()
  @ApiProperty({
    enum: MessageReturnTypes,
    type: String,
    description: '返回消息类型',
  })
  type: MessageReturnTypes;

  @Expose()
  @ApiProperty({
    type: Number,
    description: '用户ID',
  })
  userId: number;

  @Expose()
  @ApiProperty({
    type: String,
    description: '用户昵称',
  })
  nickName: string;

  @Expose()
  @ApiProperty({
    type: String,
    description: '用户头像',
  })
  avatarUrl: string;

  @Expose()
  @ApiProperty({
    type: Date,
    description: '时间',
  })
  createdAt: Date;

  @Expose()
  @ApiProperty({
    type: Number,
    required: false,
    description: '点位收藏ID',
  })
  psaveId: number;

  @Expose()
  @ApiProperty({
    type: String,
    required: false,
    description: '点位名称',
  })
  name: string;

  @Expose()
  @ApiProperty({
    type: String,
    required: false,
    description: '地图分类名称',
  })
  sortName: string;

  @Expose()
  @ApiProperty({
    type: Number,
    required: false,
    description: '点位收藏ID',
  })
  noteId: number;

  @Expose()
  @ApiProperty({
    type: String,
    required: false,
    description: '文章title',
  })
  title: string;

  @Expose()
  @ApiProperty({
    type: String,
    required: false,
    description: '文章对应的图片或者视频',
  })
  media: string;

  @Expose()
  @ApiProperty({
    enum: UserClockFeels,
    type: String,
    required: false,
    description: '打卡体验',
  })
  feel: UserClockFeels;

  @Expose()
  @ApiProperty({
    type: Number,
    required: false,
    description: '一级评论ID',
  })
  fatherId: number;

  @Expose()
  @ApiProperty({
    type: Number,
    required: false,
    description: '评论的上级评论ID',
  })
  upId: number;

  @Expose()
  @ApiProperty({
    enum: NoteCommentTypes,
    type: String,
    required: false,
    description: '评论类型',
  })
  cType: NoteCommentTypes;

  @Expose()
  @ApiProperty({
    type: Number,
    required: false,
    description: '评论ID',
  })
  commentId: number;

  @Expose()
  @ApiProperty({
    type: Boolean,
    required: false,
    description: '评论是否点赞',
  })
  isLiked: boolean;

  @Expose()
  @ApiProperty({
    type: String,
    required: false,
    description: '评论',
  })
  comment: string;

  @Expose()
  @ApiProperty({
    type: String,
    required: false,
    description: '评论的回复',
  })
  fComment: string;

  @Expose()
  @ApiProperty({
    type: String,
    required: false,
    description: '系统消息TAG',
  })
  tag: string;

  @Expose()
  @ApiProperty({
    type: String,
    required: false,
    description: '系统消息信息',
  })
  description: string;
}

/**
 * 返回消息信息DTO
 */
export class MessagesDTO extends PageResponseDTO {
  constructor() {
    super();
  }

  @ApiProperty({
    type: [MessageInternalDTO],
    description: '消息信息列表',
  })
  messages: MessageInternalDTO[];
}
