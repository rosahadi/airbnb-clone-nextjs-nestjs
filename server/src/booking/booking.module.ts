import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './booking.entity';
import { Property } from '../property/entities/property.entity';
import { BookingService } from './booking.service';
import { BookingResolver } from './booking.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, Property])],
  providers: [BookingService, BookingResolver],
  exports: [BookingService],
})
export class BookingModule {}
