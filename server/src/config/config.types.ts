import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { AuthConfig } from './auth.config';
import { FrontendConfig } from './frontend.config';
import { EmailConfig } from './email.config';
import { CloudinaryConfig } from './cloudinary.config';
import { StripeConfig } from './stripe.config';

export interface ConfigType {
  database: TypeOrmModuleOptions;
  auth: AuthConfig;
  frontend: FrontendConfig;
  email: EmailConfig;
  cloudinary: CloudinaryConfig;
  stripe: StripeConfig;
}

export const appConfigSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  DB_HOST: Joi.string().default('localhost'),
  DB_PORT: Joi.number().default(5432),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_DATABASE: Joi.string().required(),
  DB_SYNC: Joi.number().valid(0, 1).required(),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().required(),
  JWT_COOKIE_EXPIRES_IN: Joi.number().default(90),
  CLIENT_URL: Joi.string().uri().default('http://localhost:3000'),
  RESEND_API_KEY: Joi.string().required(),
  FROM_EMAIL: Joi.string().email().default('Airbnb-clone <no-reply@rosah.dev>'),

  CLOUDINARY_CLOUD_NAME: Joi.string().required(),
  CLOUDINARY_API_KEY: Joi.string().required(),
  CLOUDINARY_API_SECRET: Joi.string().required(),
  CLOUDINARY_BASE_FOLDER: Joi.string().default('airbnb'),
  CLOUDINARY_PROFILE_SIZE_LIMIT: Joi.number().default(5 * 1024 * 1024), // 5MB
  CLOUDINARY_PROPERTY_SIZE_LIMIT: Joi.number().default(10 * 1024 * 1024), // 10MB

  STRIPE_SECRET_KEY: Joi.string().required(),
  STRIPE_PUBLISHABLE_KEY: Joi.string().required(),
  STRIPE_WEBHOOK_SECRET: Joi.string().required(),
});
