import { ApiProperty } from '@nestjs/swagger';
import { NoteCommentTypes } from '@rehuo/common/constants/note.constant';
import { BaseDTO } from '@rehuo/common/dtos/base.response.dto';
import { PageResponseDTO } from '@rehuo/common/dtos/page.response.dto';
import { Exclude, Expose } from 'class-transformer';

/**
 * 评论信息
 */
@Exclude()
export class NoteCommentInternalDTO {
  @Expose()
  @ApiProperty({
    type: Number,
    description: '评论ID',
  })
  commentId: number;

  @Expose()
  @ApiProperty({
    type: Date,
    description: '对应评论发表时间',
  })
  createdAt: Date;

  @Expose()
  @ApiProperty({
    enum: NoteCommentTypes,
    type: () => NoteCommentTypes,
    description: '评论类型',
  })
  type: NoteCommentTypes;

  @Expose()
  @ApiProperty({
    type: String,
    description: '评论内容',
  })
  comment: string;

  @Expose()
  @ApiProperty({
    type: Number,
    description: '点赞次数',
  })
  likes: number;

  @Expose()
  @ApiProperty({
    type: Number,
    description: '评论者ID',
  })
  userId: number;

  @Expose()
  @ApiProperty({
    type: String,
    description: '评论者的头像',
  })
  avatarUrl: string;

  @Expose()
  @ApiProperty({
    type: String,
    description: '评论者的昵称',
  })
  nickName: string;

  @Expose()
  @ApiProperty({
    type: Boolean,
    description: '是否点赞',
  })
  isLiked: boolean;
}

/**
 * 包含第一条子评论的评论信息
 */
@Exclude()
export class NoteCommentAnswerInternalDTO extends NoteCommentInternalDTO {
  @Expose()
  @ApiProperty({
    type: Number,
    description: '第一条子评论ID',
  })
  aCommentId: number;

  @Expose()
  @ApiProperty({
    type: Date,
    description: '第一条子评论发表时间',
  })
  aCreatedAt: Date;

  @Expose()
  @ApiProperty({
    enum: NoteCommentTypes,
    type: () => NoteCommentTypes,
    description: '第一条子评论类型',
  })
  aType: NoteCommentTypes;

  @Expose()
  @ApiProperty({
    type: String,
    description: '第一条子评论内容',
  })
  aComment: string;

  @Expose()
  @ApiProperty({
    type: Number,
    description: '第一条子评论者ID',
  })
  aUserId: number;

  @Expose()
  @ApiProperty({
    type: String,
    description: '第一条子评论者头像',
  })
  aAvatarUrl: string;

  @Expose()
  @ApiProperty({
    type: String,
    description: '第一条子评论者昵称',
  })
  aNickName: string;

  @Expose()
  @ApiProperty({
    type: Number,
    description: '子评论总条数',
  })
  aCounts: number;

  @Expose()
  @ApiProperty({
    type: Number,
    description: '子评论的回复总数',
  })
  aACounts: number;

  @Expose()
  @ApiProperty({
    type: Number,
    description: '子评论是否被点赞',
  })
  aIsLiked: number;

  @Expose()
  @ApiProperty({
    type: Number,
    description: '子评论的点赞次数',
  })
  aLikes: number;
}

/**
 * 子评论信息
 */
@Exclude()
export class NoteSubCommentInternalDTO {
  @Expose()
  @ApiProperty({
    type: Number,
    description: '评论ID',
  })
  commentId: number;

  @Expose()
  @ApiProperty({
    type: Date,
    description: '对应评论发表时间',
  })
  createdAt: Date;

  @Expose()
  @ApiProperty({
    enum: NoteCommentTypes,
    type: () => NoteCommentTypes,
    description: '评论类型',
  })
  type: NoteCommentTypes;

  @Expose()
  @ApiProperty({
    type: String,
    description: '评论内容',
  })
  comment: string;

  @Expose()
  @ApiProperty({
    type: String,
    description: '评论发起者的头像',
  })
  fromAvatarUrl: string;

  @Expose()
  @ApiProperty({
    type: String,
    description: '评论发起者的昵称',
  })
  fromNickName: string;

  @Expose()
  @ApiProperty({
    type: Number,
    description: '评论发起者的userId',
  })
  fromUserId: number;

  @Expose()
  @ApiProperty({
    type: Number,
    description: '子评论的点赞次数',
  })
  likes: number;

  @Expose()
  @ApiProperty({
    type: Boolean,
    description: '是否对子评论进行了点赞',
  })
  isLiked: boolean;

  @Expose()
  @ApiProperty({
    type: String,
    description: '评论针对者的昵称',
  })
  toNickName: string;

  @Expose()
  @ApiProperty({
    type: Number,
    description: '评论针对者的userId',
  })
  toUserId: number;
}

/**
 * 评论DTO数据
 */
export class NoteCommentDTO extends BaseDTO {
  constructor() {
    super();
  }

  @ApiProperty({
    type: NoteCommentInternalDTO,
    description: '评论信息',
  })
  note: NoteCommentInternalDTO;
}

/**
 * 删除评论DTO数据
 */
export class NoteCommentDeleteResultDTO extends BaseDTO {
  constructor() {
    super();
  }

  @ApiProperty({
    type: Number,
    description: '删除的评论条数',
  })
  counts: number;
}

/**
 * 评论列表DTO数据
 */
export class NoteCommentsDTO extends PageResponseDTO {
  constructor() {
    super();
  }

  @ApiProperty({
    type: Number,
    description: '评论信息总数',
  })
  counts: number;

  @ApiProperty({
    type: [NoteCommentAnswerInternalDTO],
    description: '头部评论信息列表',
  })
  comments: NoteCommentAnswerInternalDTO[];
}

/**
 * 子评论列表DTO数据
 */
export class NoteSubCommentsDTO extends PageResponseDTO {
  constructor() {
    super();
  }

  @ApiProperty({
    type: [NoteSubCommentInternalDTO],
    description: '子评论信息列表',
  })
  comments: NoteSubCommentInternalDTO[];
}
