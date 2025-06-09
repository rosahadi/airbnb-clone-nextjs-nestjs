import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { User } from '../../users/user.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TokenUtils {
  constructor(private configService: ConfigService) {}

  setCookieToken(res: Response, token: string): void {
    const cookieExpiresInDays = parseInt(
      this.configService.get('JWT_COOKIE_EXPIRES_IN') || '7',
      10,
    );

    const cookieOptions = {
      expires: new Date(Date.now() + cookieExpiresInDays * 24 * 60 * 60 * 1000),
      httpOnly: true,
      sameSite: 'strict' as const,
      secure: this.configService.get('NODE_ENV') === 'production',
      path: '/', // this ensures cookie is sent with all requests
    };

    // Set the cookie with the token
    res.cookie('airbnbCloneJWT', token, cookieOptions);
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
