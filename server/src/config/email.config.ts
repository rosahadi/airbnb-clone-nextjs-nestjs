import { registerAs } from '@nestjs/config';

export interface EmailConfig {
  resendApiKey: string;
  fromEmail: string;
}

export const emailConfig = registerAs(
  'email',
  (): EmailConfig => ({
    resendApiKey: process.env.RESEND_API_KEY as string,
    fromEmail: process.env.FROM_EMAIL ?? 'Airbnb-clone <no-reply@rosah.dev>',
  }),
);
