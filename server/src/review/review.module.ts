import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './review.entity';
import { Property } from '../property/entities/property.entity';
import { ReviewService } from './review.service';
import { ReviewResolver } from './review.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Property])],
  providers: [ReviewService, ReviewResolver],
  exports: [ReviewService],
})
export class ReviewModule {}
