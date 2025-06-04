import { registerAs } from '@nestjs/config';

export interface StripeConfig {
  secretKey: string;
  publishableKey: string;
  webhookSecret: string;
  apiVersion: string;
}

export const stripeConfig = registerAs(
  'stripe',
  (): StripeConfig => ({
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    apiVersion: '2024-05-10',
  }),
);
