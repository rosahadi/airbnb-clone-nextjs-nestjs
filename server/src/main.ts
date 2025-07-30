import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { FrontendConfig } from './config/frontend.config';
import { graphqlUploadExpress } from 'graphql-upload-minimal';
import { Express } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const clientUrl = configService.get<FrontendConfig>('frontend')?.clientUrl;

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      disableErrorMessages: false,
      exceptionFactory: (errors) => {
        return new BadRequestException(errors);
      },
    }),
  );

  app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }));

  app.use(cookieParser());

  app.enableCors({
    origin: [
      clientUrl,

      'http://localhost:3000',
      'http://localhost:3001',

      /^https:\/\/.*\.vercel\.app$/,
    ],
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
      'Cookie',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    exposedHeaders: ['Set-Cookie'],
  });

  const expressApp = app.getHttpAdapter().getInstance() as Express;
  expressApp.set('trust proxy', 1);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
