import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { FrontendConfig } from './config/frontend.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const clientUrl = configService.get<FrontendConfig>('frontend')?.clientUrl;

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  app.use(cookieParser());

  app.enableCors({
    origin: clientUrl,
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
