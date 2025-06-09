import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { User } from './user.entity';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthConfig } from 'src/config/auth.config';
import { TypedConfigService } from 'src/config/typed-config.service';
import { AuthModule } from 'src/auth/auth.module';
import { PasswordService } from 'src/auth/password.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    CloudinaryModule,
    forwardRef(() => AuthModule),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: TypedConfigService) => ({
        secret: config.get<AuthConfig>('auth')?.jwt.secret,
        signOptions: {
          expiresIn: config.get<AuthConfig>('auth')?.jwt.expiresIn,
        },
      }),
    }),
  ],
  providers: [
    UsersResolver,
    UsersService,
    PasswordService,
    {
      provide: TypedConfigService,
      useExisting: ConfigService,
    },
  ],
  exports: [UsersService, PasswordService],
})
export class UsersModule {}
