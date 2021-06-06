import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AuthModule } from '@rehuo/auth/auth.module';
import { VERSION } from '@rehuo/common/constants/system.constant';
import { HintModule } from '@rehuo/hint/hint.module';
import { MapModule } from '@rehuo/map/map.module';
import { MapPointModule } from '@rehuo/map/modules/point/map.point.module';
import { PointNoteModule } from '@rehuo/map/modules/point/modules/note/point.note.module';
import { PointRecommendModule } from '@rehuo/map/modules/point/modules/recommend/point.recommend.module';
import { PointSaveModule } from '@rehuo/map/modules/point/modules/save/point.save.module';
import { PointSortModule } from '@rehuo/map/modules/point/modules/sort/point.sort.module';
import { MapSaveModule } from '@rehuo/map/modules/save/map.save.module';
import { MapShareModule } from '@rehuo/map/modules/share/map.share.module';
import { MediaModule } from '@rehuo/media/media.module';
import { MessageModule } from '@rehuo/message/message.module';
import { UserClockModule } from '@rehuo/user/modules/userclock/user.clock.module';
import { UserModule } from '@rehuo/user/user.module';
import { ISwaggerSetting } from '../types/swagger.interface';

const swaggerSetting: ISwaggerSetting[] = [
  {
    tags: 'auth',
    title: 'auth api',
    description: '登录和注册认证API',
    version: VERSION,
    modules: [AuthModule],
  },
  {
    tags: 'user',
    title: 'user api',
    description: '用户操作API',
    version: VERSION,
    modules: [UserModule, UserClockModule],
  },
  {
    tags: 'map/point',
    title: 'mappoint api',
    description: '地图点位操作API',
    version: VERSION,
    modules: [MapPointModule],
  },
  {
    tags: 'map/point/sort',
    title: 'pointsort api',
    description: '点位分类操作API',
    version: VERSION,
    modules: [PointSortModule],
  },
  {
    tags: 'map/point/save',
    title: 'pointsave api',
    description: '点位收藏操作API',
    version: VERSION,
    modules: [PointSaveModule],
  },
  {
    tags: 'map/point/note',
    title: 'pointnote api',
    description: '点位文章操作API',
    version: VERSION,
    modules: [PointNoteModule],
  },
  {
    tags: 'map/save',
    title: 'mapsave api',
    description: '地图收藏操作API',
    version: VERSION,
    modules: [MapSaveModule],
  },
  {
    tags: 'map/share',
    title: 'mapshare api',
    description: '分享操作API',
    version: VERSION,
    modules: [MapShareModule],
  },
  {
    tags: 'media',
    title: 'media api',
    description: '图片、视频操作API',
    version: VERSION,
    modules: [MediaModule],
  },
  {
    tags: 'map',
    title: 'map api',
    description: '地图操作API',
    version: VERSION,
    modules: [MapModule],
  },
  {
    tags: 'hint',
    title: 'hint api',
    description: '消息提示API',
    version: VERSION,
    modules: [HintModule],
  },
  {
    tags: 'message',
    title: 'message api',
    description: '消息API',
    version: VERSION,
    modules: [MessageModule],
  },
  {
    tags: 'map/point/recommend',
    title: 'point recommend api',
    description: '点位推荐API',
    version: VERSION,
    modules: [PointRecommendModule],
  },
];

const SWAGGER_PREFIX = 'api/';

/**
 * 启动swagger
 */
export function swaggerSetup(app: INestApplication) {
  swaggerSetting.forEach(swagger => {
    const options = new DocumentBuilder()
      .setTitle(swagger.title)
      .setDescription(swagger.description)
      .setVersion(swagger.version)
      .addTag(swagger.title)
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, options, {
      include: swagger.modules,
    });

    SwaggerModule.setup(SWAGGER_PREFIX + swagger.tags, app, document);
  });
}
