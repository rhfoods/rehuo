import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { ERRORS } from '@rehuo/common/constants/error.constant';
import { Request, Response } from 'express';
import { AuthTokenService } from './passport/auth.token.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly atService: AuthTokenService) {}

  async use(req: Request, res: Response, next: () => void) {
    const authHeader = req.headers.authorization;
    const jwtoken = authHeader && authHeader.split(' ')[1];
    if (jwtoken) {
      const user: any = await this.atService.validate(jwtoken);
      const { rl, id, tk, sr } = user;
      req['user'] = {
        rl,
        id,
        tk,
      };
      if (sr) {
        req['user'].sr = sr;
      }
    } else {
      throw new UnauthorizedException(ERRORS.TOKEN_INVALID);
    }

    next();
  }
}
