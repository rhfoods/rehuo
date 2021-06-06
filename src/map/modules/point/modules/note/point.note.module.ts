import {
  forwardRef,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthMiddleware } from '@rehuo/auth/auth.middleware';
import { AuthModule } from '@rehuo/auth/auth.module';
import { MessageModule } from '@rehuo/message/message.module';
import { CommentLikeEntity } from '@rehuo/models/comment.like.entity';
import { NoteCommentEntity } from '@rehuo/models/note.comment.entity';
import { NoteLikeEntity } from '@rehuo/models/note.like.entity';
import { NoteSaveEntity } from '@rehuo/models/note.save.entity';
import { NoteStatEntity } from '@rehuo/models/note.stat.entity';
import { PointNoteEntity } from '@rehuo/models/point.note.entity';
import { RedisModule } from '@rehuo/redis/redis.module';
import { SharedModule } from '@rehuo/shared/shared.module';
import { UserModule } from '@rehuo/user/user.module';
import { MapPointModule } from '../../map.point.module';
import { PointSaveModule } from '../save/point.save.module';
import { NoteCommentController } from './controllers/note.comment.controller';
import { PointNoteController } from './controllers/point.note.controller';
import { NoteCommentService } from './services/note.comment.service';
import { NoteStatService } from './services/note.stat.service';
import { PointNoteService } from './services/point.note.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PointNoteEntity,
      NoteStatEntity,
      NoteLikeEntity,
      NoteSaveEntity,
      NoteCommentEntity,
      CommentLikeEntity,
    ]),
    forwardRef(() => MapPointModule),
    forwardRef(() => AuthModule),
    forwardRef(() => PointSaveModule),
    forwardRef(() => UserModule),
    forwardRef(() => RedisModule),
    forwardRef(() => SharedModule),
    forwardRef(() => MessageModule),
  ],
  controllers: [PointNoteController, NoteCommentController],
  providers: [PointNoteService, NoteStatService, NoteCommentService],
  exports: [PointNoteService, NoteStatService, NoteCommentService],
})
export class PointNoteModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(
      {
        path: 'map/point/note',
        method: RequestMethod.POST,
      },
      {
        path: 'map/point/note',
        method: RequestMethod.PUT,
      },
      {
        path: 'map/point/note',
        method: RequestMethod.DELETE,
      },
      {
        path: 'map/point/note',
        method: RequestMethod.GET,
      },
      {
        path: 'map/point/notes',
        method: RequestMethod.GET,
      },
      {
        path: 'map/point/note/like',
        method: RequestMethod.POST,
      },
      {
        path: 'map/point/note/save',
        method: RequestMethod.POST,
      },
      {
        path: 'map/point/note/save',
        method: RequestMethod.DELETE,
      },
      {
        path: 'map/point/note/more',
        method: RequestMethod.GET,
      },
      {
        path: 'map/point/note/comment',
        method: RequestMethod.POST,
      },
      {
        path: 'map/point/note/comment',
        method: RequestMethod.DELETE,
      },
      {
        path: 'map/point/note/comments',
        method: RequestMethod.GET,
      },
      {
        path: 'map/point/note/comment/like',
        method: RequestMethod.POST,
      },
      {
        path: 'map/point/note/audit',
        method: RequestMethod.POST,
      },
      {
        path: 'map/point/note/subcomments',
        method: RequestMethod.GET,
      },
    );
  }
}
