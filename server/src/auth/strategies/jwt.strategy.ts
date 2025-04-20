import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';

import { TypedConfigService } from 'src/config/typed-config.service';
import { UsersService } from '../../users/users.service';
import { AuthConfig } from 'src/config/auth.config';

interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly config: TypedConfigService,
    private readonly usersService: UsersService,
  ) {
    const auth = config.get<AuthConfig>('auth');

    if (!auth) {
      throw new Error('Auth config not found');
    }

    const jwtFromRequest = (req: Request): string | null => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      return ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super({
      jwtFromRequest,
      ignoreExpiration: false,
      secretOrKey: auth.jwt.secret,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }
    return user;
  }
}
