import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuditorService } from '@rehuo/auditor/auditor.service';
import { ConfigNamespaces } from '@rehuo/common/constants/config.constant';
import { ERRORS } from '@rehuo/common/constants/error.constant';
import { RedisNames, RedisTimeouts } from '@rehuo/common/constants/redis.constant';
import { SystemRoleTypes } from '@rehuo/common/constants/system.constant';
import { IToken } from '@rehuo/common/interfaces/jwt.interface';
import { UtilsService } from '@rehuo/common/providers/utils.service';
import { RedisService } from '@rehuo/redis/redis.service';
import { UserService } from '@rehuo/user/services/user.service';
import { Redis } from 'ioredis';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

@Injectable()
export class AuthTokenService {
  private secretkey;
  private logger;
  private redis: Redis;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => AuditorService))
    private readonly auditorService: AuditorService,
    private readonly redisService: RedisService,
  ) {
    this.secretkey = configService.get(ConfigNamespaces.JWT).secretKey;
    this.logger = new Logger(AuthTokenService.name);
    this.redis = redisService.getClient();
  }

  /**
   * 通过token验证身份信息
   */
  async validate(jwtoken: string) {
    try {
      const payload: IToken = this.jwtService.verify(jwtoken, {
        secret: this.secretkey,
      });
      //检查运行环境是否一致
      if (payload.en !== this.configService.get(ConfigNamespaces.APP).env) {
        throw new UnauthorizedException(ERRORS.ENVIRONMENT_NOTMATCHED);
      }

      let result, key;

      //根据ID值在数据库中获取对应信息
      switch (payload.rl) {
        case SystemRoleTypes.USER:
          key = UtilsService.format(RedisNames.USER_LOGINED, payload.id);
          result = await this.redis.get(key);
          if (!result) {
            const user = await this.userService.findOneNotException(
              { userId: payload.id },
              ['userId', 'wxUnionId'],
            );
            if (!user) {
              throw new BadRequestException(ERRORS.PARAMS_INVALID);
            }
            if (!user.wxUnionId) {
              throw new ForbiddenException(ERRORS.USER_LACK_UNIONID);
            }
            await this.redis.set(
              UtilsService.format(RedisNames.USER_LOGINED, payload.id),
              '1',
              'EX',
              RedisTimeouts.USER_LOGINED,
              'NX',
            );
          }
          break;
        case SystemRoleTypes.AUDITOR:
          key = UtilsService.format(RedisNames.AUDITOR_LOGINED, payload.id);
          result = await this.redis.get(key);
          if (!result) {
            await this.auditorService.getOne({ auditorId: payload.id }, ['name']);
            await this.redis.set(
              UtilsService.format(RedisNames.AUDITOR_LOGINED, payload.id),
              '1',
              'EX',
              RedisTimeouts.AUDITOR_LOGINED,
              'NX',
            );
          }
          break;
        default:
          break;
      }

      return payload;
    } catch (info) {
      /**
       *  出现令牌超时或者错误，抛出对应的异常
       */
      if (info instanceof TokenExpiredError) {
        throw new UnauthorizedException(ERRORS.TOKEN_EXPIRED);
      } else if (info instanceof JsonWebTokenError) {
        throw new UnauthorizedException(ERRORS.TOKEN_INVALID);
      } else {
        this.logger.error(info);
      }
    }
  }
}
