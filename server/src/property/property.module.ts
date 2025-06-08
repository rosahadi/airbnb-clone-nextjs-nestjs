import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Property } from './entities/property.entity';
import { PropertyService } from './property.service';
import { PropertyResolver } from './property.resolver';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { Booking } from 'src/booking/booking.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Property, Booking]), CloudinaryModule],
  providers: [PropertyService, PropertyResolver],
  exports: [PropertyService],
})
export class PropertyModule {}
