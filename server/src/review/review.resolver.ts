import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ReviewService } from './review.service';
import { Review } from './review.entity';
import { User } from '../users/entities/user.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { VerifiedEmailGuard } from '../auth/guards/verified-email.guard';
import { Public } from '../auth/decorators/public.decorator';
import { CreateReviewInput } from './dto/create-review.input';
import { UpdateReviewInput } from './dto/update-review.input';
import { ReviewFilterInput } from './dto/review-filter.input';
import { PropertyRatingDto } from './dto/property-rating.dto';

@Resolver(() => Review)
export class ReviewResolver {
  constructor(private readonly reviewService: ReviewService) {}

  // ---- Public Queries ----

  @Public()
  @Query(() => [Review])
  async reviews(
    @Args('filters', { nullable: true }) filters?: ReviewFilterInput,
  ): Promise<Review[]> {
    return this.reviewService.findAllReviews(filters);
  }

  @Public()
  @Query(() => Review)
  async review(@Args('id', { type: () => ID }) id: string): Promise<Review> {
    return this.reviewService.findReviewById(id);
  }

  @Public()
  @Query(() => [Review])
  async propertyReviews(
    @Args('propertyId', { type: () => ID }) propertyId: string,
  ): Promise<Review[]> {
    return this.reviewService.getPropertyReviews(propertyId);
  }

  @Public()
  @Query(() => PropertyRatingDto)
  async propertyRating(
    @Args('propertyId', { type: () => ID }) propertyId: string,
  ): Promise<PropertyRatingDto> {
    return this.reviewService.getPropertyRating(propertyId);
  }

  // ---- Authenticated Queries ----

  @Query(() => [Review])
  @UseGuards(VerifiedEmailGuard)
  async myReviews(@CurrentUser() user: User): Promise<Review[]> {
    return this.reviewService.getUserReviews(user.id);
  }

  @Query(() => Review, { nullable: true })
  @UseGuards(VerifiedEmailGuard)
  async myPropertyReview(
    @CurrentUser() user: User,
    @Args('propertyId', { type: () => ID }) propertyId: string,
  ): Promise<Review | null> {
    return this.reviewService.checkUserReviewedProperty(user.id, propertyId);
  }

  // ---- Mutations ----

  @Mutation(() => Review)
  @UseGuards(VerifiedEmailGuard)
  async createReview(
    @CurrentUser() user: User,
    @Args('createReviewInput') createReviewInput: CreateReviewInput,
  ): Promise<Review> {
    return this.reviewService.createReview(user, createReviewInput);
  }

  @Mutation(() => Review)
  @UseGuards(VerifiedEmailGuard)
  async updateReview(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
    @Args('updateReviewInput') updateReviewInput: UpdateReviewInput,
  ): Promise<Review> {
    return this.reviewService.updateReview(user.id, id, updateReviewInput);
  }

  @Mutation(() => Review)
  @UseGuards(VerifiedEmailGuard)
  async deleteReview(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Review> {
    return this.reviewService.deleteReview(user.id, id);
  }
}
