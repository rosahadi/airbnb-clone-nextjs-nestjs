import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { TypedConfigService } from './config/typed-config.service';
import { typeOrmConfig } from './config/database.config';
import { User } from './users/entities/user.entity';
import { Request } from 'express';
import { authConfig } from './config/auth.config';
import { appConfigSchema } from './config/config.types';
import { frontendConfig } from './config/frontend.config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import { emailConfig } from './config/email.config';
import { cloudinaryConfig } from './config/cloudinary.config';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { Property } from './property/entities/property.entity';
import { Favorite } from './favorite/favorite.entity';
import { Booking } from './booking/booking.entity';
import { Review } from './review/review.entity';
import { PropertyModule } from './property/property.module';
import { FavoriteModule } from './favorite/favorite.module';
import { ReviewModule } from './review/review.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: TypedConfigService) => ({
        ...(await configService.get('database')),
        entities: [User, Property, Favorite, Booking, Review],
      }),
    }),

    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        typeOrmConfig,
        authConfig,
        frontendConfig,
        emailConfig,
        cloudinaryConfig,
      ],
      validationSchema: appConfigSchema,
      validationOptions: {
        abortEarly: true,
      },
    }),

    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      graphiql: true,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      context: ({ req, res }: { req: Request; res: Response }) => ({
        req,
        res,
      }),
    }),

    UsersModule,
    AuthModule,
    EmailModule,
    CloudinaryModule,
    PropertyModule,
    FavoriteModule,
    ReviewModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: TypedConfigService,
      useExisting: ConfigService,
    },
  ],
})
export class AppModule {}
