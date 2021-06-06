import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuditorService } from '@rehuo/auditor/auditor.service';
import { AuditorLoginDTO } from '@rehuo/auditor/dtos/auditor.login.dto';
import { ConfigNamespaces } from '@rehuo/common/constants/config.constant';
import { ERRORS } from '@rehuo/common/constants/error.constant';
import { MessageQueryTypes, SystemMessageTypes } from '@rehuo/common/constants/message.constant';
import { RedisNames, RedisTimeouts } from '@rehuo/common/constants/redis.constant';
import { RehuoMarketerIds } from '@rehuo/common/constants/rehuo.constant';
import {
  SystemEnvironments,
  SystemRoleTypes,
} from '@rehuo/common/constants/system.constant';
import { WechatMiniTypes } from '@rehuo/common/constants/wechat.constant';
import { IToken } from '@rehuo/common/interfaces/jwt.interface';
import { ISystemMessage } from '@rehuo/common/interfaces/message.interface';
import { ISmsParam } from '@rehuo/common/interfaces/sms.interface';
import { UtilsService } from '@rehuo/common/providers/utils.service';
import { HintService } from '@rehuo/hint/hint.service';
import { MessageService } from '@rehuo/message/message.service';
import { RedisService } from '@rehuo/redis/redis.service';
import { SmsService } from '@rehuo/shared/services/sms.service';
import { TokenService } from '@rehuo/shared/services/token.service';
import { WechatService } from '@rehuo/shared/services/wechat.service';
import { UserService } from '@rehuo/user/services/user.service';
import { Redis } from 'ioredis';
import { AuditorLoginedDTO, UserLoginedDTO } from './dtos/auth.response.dto';
import { SmsGetDTO } from './dtos/sms.crud.dto';
import { WechatCodeDTO } from './dtos/wechat.register.dto';

@Injectable()
export class AuthService {
  private redis: Redis;

  constructor(
    private readonly wechatService: WechatService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly smsService: SmsService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    @Inject(forwardRef(() => HintService))
    private readonly hintService: HintService,
    @Inject(forwardRef(() => AuditorService))
    private readonly auditorService: AuditorService,
    @Inject(forwardRef(() => MessageService))
    private readonly msgService: MessageService,
  ) {
    this.redis = redisService.getClient();
  }

  /**
   * 生成token
   */
  private async newToken(role: SystemRoleTypes, commonId: number): Promise<any> {
    const payload: IToken = {
      rl: role,
      id: commonId,
      en: this.configService.get(ConfigNamespaces.APP).env,
    };
    const token = await this.tokenService.create(payload);
    let key, expired;

    if (role === SystemRoleTypes.USER) {
      key = UtilsService.format(RedisNames.USER_LOGINED, payload.id);
      expired = RedisTimeouts.USER_LOGINED;
    } else if (role === SystemRoleTypes.AUDITOR) {
      key = UtilsService.format(RedisNames.AUDITOR_LOGINED, payload.id);
      expired = RedisTimeouts.AUDITOR_LOGINED;
    }

    const logined = await this.redis.get(key);
    if (!logined) {
      await this.redis.set(key, '1', 'EX', expired, 'NX');
    }
    return token;
  }

  /**
   * 通过wxcode进行登录
   */
  async wxcodeLogin(
    role: SystemRoleTypes,
    miniType: WechatMiniTypes,
    aDto: WechatCodeDTO,
  ): Promise<UserLoginedDTO> {
    let rUser: any;
    if (miniType === WechatMiniTypes.CREATOR) {
      const { openid, unionid } = await this.wechatService.snsAccessToken(aDto.code);
      const wxCOpenId = openid;
      const wxUnionId = unionid;

      rUser = await this.userService.findOneNotException({ wxCOpenId });
      if (!rUser) {
        rUser = await this.userService.findOneNotException({ wxUnionId });
        if (!rUser) {
          throw new ForbiddenException(ERRORS.CREATOR_USER_NOEXIST);
        } else {
          await this.userService.update({ userId: rUser.userId }, { wxCOpenId });
        }
      }
    } else {
      const { openId, unionId } = await this.wechatService.openId(
        WechatMiniTypes.USER,
        aDto,
      );
      const user: any = {};
      user.wxOpenId = openId;
      aDto.avatarUrl ? (user.avatarUrl = aDto.avatarUrl) : null;
      aDto.nickName ? (user.nickName = aDto.nickName) : null;
      unionId ? (user.wxUnionId = unionId) : null;
      const { isExist, entity } = await this.userService.createOne(user);
      if (!isExist) {
        entity.hints = 1;
      } else {
        const {
          savetops,
          likes,
          clocks,
          systems,
          comments,
        } = await this.hintService.getOne(entity.userId);
        entity.hints = savetops + likes + clocks + systems + comments;
      }
      rUser = entity;

      if (!entity.isNotified) {
        const message: ISystemMessage = {
          userId: 0,
          type: SystemMessageTypes.FIRST_LOGINNED,
        };
        await this.msgService.message(rUser.userId, message, MessageQueryTypes.SYSTEM);
        await this.userService.update({ userId: entity.userId }, { isNotified: true });
      }

      /**
       * 根据数据库中userId决定哪些是内部管理人员
       */
      rUser.isMarketer =
        this.configService.get(ConfigNamespaces.APP).env === SystemEnvironments.PROD
          ? RehuoMarketerIds.includes(entity.userId)
          : entity.userId < 15;
    }

    const token = await this.newToken(role, rUser.userId);
    return { ...rUser, token };
  }

  /**
   * 审核者登录认证
   */
  async auditorLogin(aDto: AuditorLoginDTO): Promise<AuditorLoginedDTO> {
    const auditor = await this.auditorService.getOne({ account: aDto.account });

    if (!(await UtilsService.validateHash(aDto.password, auditor.password))) {
      throw new UnauthorizedException(ERRORS.AUDITOR_PASSWORD);
    }

    const token = await this.newToken(SystemRoleTypes.AUDITOR, auditor.auditorId);

    return { ...auditor, token };
  }

  /**
   * 发送短信验证码
   */
  async sendSms(cDto: SmsGetDTO): Promise<Boolean> {
    const authcode = Math.floor(Math.random() * 10000000000)
      .toString()
      .slice(0, 6);
    const smsReq: ISmsParam = {
      SignName: cDto.sign,
      TemplateCode: cDto.template,
      SmsData: { code: authcode },
      PhoneNumbers: cDto.phone,
    };

    const isSucceed = await this.smsService.send(smsReq);
    if (isSucceed) {
      const key = UtilsService.format(RedisNames.TRANSFER_PHONE, cDto.phone, cDto.userId);
      await this.redisService.save(key, authcode, RedisTimeouts.TRANSFER_PHONE);
    }

    return isSucceed;
  }
}
