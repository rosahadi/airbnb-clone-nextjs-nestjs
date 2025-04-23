import { registerAs } from '@nestjs/config';

export interface AuthConfig {
  jwt: {
    secret: string;
    expiresIn: string;
    cookieExpiresIn: number;
  };
  nodeEnv: string;
}

export const authConfig = registerAs(
  'auth',
  (): AuthConfig => ({
    jwt: {
      secret: process.env.JWT_SECRET as string,
      expiresIn: process.env.JWT_EXPIRES_IN ?? '60m',
      cookieExpiresIn: parseInt(process.env.JWT_COOKIE_EXPIRES_IN || '90', 10),
    },
    nodeEnv: process.env.NODE_ENV || 'development',
  }),
);
