import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './review.entity';
import { User } from '../users/user.entity';
import { Property } from '../property/property.entity';
import { CreateReviewInput } from './dto/create-review.input';
import { UpdateReviewInput } from './dto/update-review.input';
import { ReviewFilterInput } from './dto/review-filter.input';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
  ) {}

  async createReview(
    user: User,
    createReviewInput: CreateReviewInput,
  ): Promise<Review> {
    try {
      // Check if property exists
      const property = await this.propertyRepository.findOne({
        where: { id: createReviewInput.propertyId },
      });

      if (!property) {
        throw new NotFoundException(
          `Property with ID ${createReviewInput.propertyId} not found`,
        );
      }

      // Check if user already reviewed this property
      const existingReview = await this.reviewRepository.findOne({
        where: {
          property: { id: createReviewInput.propertyId },
          user: { id: user.id },
        },
      });

      if (existingReview) {
        throw new BadRequestException(
          'You have already reviewed this property',
        );
      }

      // Create new review
      const newReview = this.reviewRepository.create({
        rating: createReviewInput.rating,
        comment: createReviewInput.comment,
        user,
        property,
      });

      return await this.reviewRepository.save(newReview);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(
        `Failed to create review: ${errorMessage}`,
      );
    }
  }

  async findAllReviews(filters?: ReviewFilterInput): Promise<Review[]> {
    const queryBuilder = this.reviewRepository.createQueryBuilder('review');

    queryBuilder.leftJoinAndSelect('review.property', 'property');
    queryBuilder.leftJoinAndSelect('review.user', 'user');

    if (filters?.propertyId) {
      queryBuilder.andWhere('property.id = :propertyId', {
        propertyId: filters.propertyId,
      });
    }

    if (filters?.userId) {
      queryBuilder.andWhere('user.id = :userId', {
        userId: filters.userId,
      });
    }

    queryBuilder.orderBy('review.createdAt', 'DESC');

    return queryBuilder.getMany();
  }

  async findReviewById(id: string): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['user', 'property'],
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    return review;
  }

  async updateReview(
    userId: string,
    reviewId: string,
    updateReviewInput: UpdateReviewInput,
  ): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
      relations: ['user', 'property'],
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${reviewId} not found`);
    }

    // Check if user is the owner of the review
    if (review.user.id !== userId) {
      throw new ForbiddenException(
        'You do not have permission to update this review',
      );
    }

    // Update review
    Object.assign(review, updateReviewInput);
    return await this.reviewRepository.save(review);
  }

  async deleteReview(userId: string, reviewId: string): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
      relations: ['user', 'property'],
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${reviewId} not found`);
    }

    // Check if user is the owner of the review
    if (review.user.id !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this review',
      );
    }

    const deletedReview = { ...review };
    await this.reviewRepository.remove(review);
    return deletedReview;
  }

  async getUserReviews(userId: string): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { user: { id: userId } },
      relations: ['property', 'user'],
    });
  }

  async getPropertyReviews(propertyId: string): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { property: { id: propertyId } },
      relations: ['user', 'property'],
    });
  }

  async getPropertyRating(
    propertyId: string,
  ): Promise<{ rating: number; count: number }> {
    const reviews = await this.reviewRepository.find({
      where: { property: { id: propertyId } },
      select: ['rating'],
    });

    if (reviews.length === 0) {
      return { rating: 0, count: 0 };
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    return {
      rating: parseFloat(averageRating.toFixed(1)),
      count: reviews.length,
    };
  }

  async checkUserReviewedProperty(
    userId: string,
    propertyId: string,
  ): Promise<Review | null> {
    return this.reviewRepository.findOne({
      where: {
        user: { id: userId },
        property: { id: propertyId },
      },
    });
  }
}
