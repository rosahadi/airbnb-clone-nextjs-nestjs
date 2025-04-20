import { registerAs } from '@nestjs/config';

export interface FrontendConfig {
  clientUrl: string;
}

export const frontendConfig = registerAs(
  'frontend',
  (): FrontendConfig => ({
    clientUrl: process.env.CLIENT_URL ?? 'http://localhost:3000',
  }),
);
