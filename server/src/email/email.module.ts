import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';
import { TypedConfigService } from '../config/typed-config.service';

@Module({
  imports: [ConfigModule],
  providers: [
    EmailService,
    {
      provide: TypedConfigService,
      useExisting: ConfigService,
    },
  ],
  exports: [EmailService],
})
export class EmailModule {}
