import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { User } from '../../users/user.entity';
import { TypedConfigService } from 'src/config/typed-config.service';
import { AuthConfig } from 'src/config/auth.config';

@Injectable()
export class TokenUtils {
  constructor(private configService: TypedConfigService) {}

  setCookieToken(res: Response, token: string): void {
    const authConfig = this.configService.get<AuthConfig>('auth');

    if (!authConfig) {
      throw new Error('Auth config not found');
    }

    const cookieExpiresInDays = authConfig.jwt.cookieExpiresIn;
    const isProduction = authConfig.nodeEnv === 'production';

    const cookieOptions = {
      expires: new Date(Date.now() + cookieExpiresInDays * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: isProduction,
      path: '/',
    };

    // Set the cookie with the token
    res.cookie('airbnbCloneJWT', token, cookieOptions);

    // debug header
    res.setHeader(
      'X-Set-Cookie-Debug',
      `airbnbCloneJWT=${token}; ${Object.entries(cookieOptions)
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        .map(([k, v]) => `${k}=${v}`)
        .join('; ')}`,
    );
  }

  createSendToken(
    user: User,
    statusCode: number,
    res: Response,
    token: string,
  ): any {
    // Set the HTTP-only cookie
    this.setCookieToken(res, token);

    // Delete the password in the response
    const userResponse = { ...user } as Partial<User>;
    delete userResponse.password;

    return {
      user: userResponse,
    };
  }
}
