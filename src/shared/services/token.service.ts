import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ConfigNamespaces } from '@rehuo/common/constants/config.constant';
import { RedisNames } from '@rehuo/common/constants/redis.constant';
import { JwtTypes, SystemRoleTypes } from '@rehuo/common/constants/system.constant';
import { IBaseToken, IJwtExpire } from '@rehuo/common/interfaces/jwt.interface';
import { UtilsService } from '@rehuo/common/providers/utils.service';
import { RedisService } from '@rehuo/redis/redis.service';

/**
 * 令牌生成服务
 */
@Injectable()
export class TokenService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => RedisService))
    private readonly redisService: RedisService,
  ) {}

  /**
   * 产生对应的access token和refresh token
   * @param payload JWT加密载荷
   * @param expiresIn JWT超时时间(可选输入)
   */
  async create<T extends IBaseToken>(payload: T, expiresIn?: IJwtExpire): Promise<any> {
    const token: any = {};
    const key = UtilsService.format(RedisNames.USER_UPDATE_TOKEN_LOCKED, payload.id);

    try {
      if (!(await this.redisService.lock(key))) {
        return;
      }

      if (!expiresIn) {
        switch (payload.rl) {
          case SystemRoleTypes.MERCHANT:
            expiresIn = this.configService.get(ConfigNamespaces.JWT).merchant;
            break;
          case SystemRoleTypes.USER:
            expiresIn = this.configService.get(ConfigNamespaces.JWT).user;
            break;
          case SystemRoleTypes.AUDITOR:
            expiresIn = this.configService.get(ConfigNamespaces.JWT).auditor;
            break;
          default:
            Logger.error(
              `${payload.rl} invalid, don't create token`,
              null,
              TokenService.name,
            );
            return;
        }
      }

      const secretKey = this.configService.get(ConfigNamespaces.JWT).secretKey;
      const { accessTime, refreshTime } = expiresIn;

      if (payload.rl === SystemRoleTypes.USER) {
        token.access = this.jwtService.sign(
          {
            ...payload,
            tk: JwtTypes.ACCESS,
          },
          {
            secret: secretKey,
            expiresIn: accessTime,
          },
        );
      } else {
        token.access = this.jwtService.sign(
          {
            ...payload,
            tk: JwtTypes.ACCESS,
          },
          {
            secret: secretKey,
            expiresIn: accessTime,
          },
        );
        token.refresh = this.jwtService.sign(
          {
            ...payload,
            tk: JwtTypes.REFRESH,
          },
          {
            secret: secretKey,
            expiresIn: refreshTime,
          },
        );
      }

      return token;
    } catch (err) {
      throw err;
    } finally {
      await this.redisService.unlock(key);
    }
  }
}
