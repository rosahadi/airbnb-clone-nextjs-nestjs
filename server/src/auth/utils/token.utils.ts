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

    console.log('🍪 Setting cookie - NODE_ENV:', authConfig.nodeEnv);
    console.log('🍪 Is production:', isProduction);
    console.log('🍪 Cookie expires in days:', cookieExpiresInDays);

    const cookieOptions = {
      expires: new Date(Date.now() + cookieExpiresInDays * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? ('none' as const) : ('lax' as const),
      path: '/',
    };

    console.log('🍪 Cookie options:', cookieOptions);

    // Set the cookie with the token
    res.cookie('airbnbCloneJWT', token, cookieOptions);

    console.log('🍪 Cookie set successfully');
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
