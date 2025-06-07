import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './booking.entity';
import { Property } from '../property/entities/property.entity';
import { BookingService } from './booking.service';
import { BookingResolver } from './booking.resolver';
import { User } from 'src/users/entities/user.entity';
import { StripeModule } from 'src/stripe/stripe.module';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, Property, User]),
    StripeModule,
    EmailModule,
  ],
  providers: [BookingService, BookingResolver],
  exports: [BookingService],
})
export class BookingModule {}
