import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { Favorite } from './favorite.entity';
import { User } from '../users/entities/user.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { VerifiedEmailGuard } from '../auth/guards/verified-email.guard';
import { FavoriteStatusResponse } from './dto/favorite-status.response';

@Resolver(() => Favorite)
export class FavoriteResolver {
  constructor(private readonly favoriteService: FavoriteService) {}

  // Get all favorites for the current user
  @Query(() => [Favorite])
  @UseGuards(VerifiedEmailGuard)
  async myFavorites(@CurrentUser() user: User): Promise<Favorite[]> {
    return this.favoriteService.getUserFavorites(user.id);
  }

  // Get favorite by ID (ensuring it belongs to the current user)
  @Query(() => Favorite)
  @UseGuards(VerifiedEmailGuard)
  async favorite(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Favorite> {
    return this.favoriteService.getFavoriteById(id);
  }

  // Check if a property is favorited by the current user
  @Query(() => FavoriteStatusResponse)
  @UseGuards(VerifiedEmailGuard)
  async checkFavoriteStatus(
    @CurrentUser() user: User,
    @Args('propertyId', { type: () => ID }) propertyId: string,
  ): Promise<FavoriteStatusResponse> {
    return this.favoriteService.checkFavoriteStatus(user.id, propertyId);
  }

  // Toggle favorite status (add if not exists, remove if exists)
  @Mutation(() => Favorite, { nullable: true })
  @UseGuards(VerifiedEmailGuard)
  async toggleFavorite(
    @CurrentUser() user: User,
    @Args('propertyId', { type: () => ID }) propertyId: string,
  ): Promise<Favorite | null> {
    return this.favoriteService.toggleFavorite(user, propertyId);
  }

  // Remove a favorite
  @Mutation(() => Favorite)
  @UseGuards(VerifiedEmailGuard)
  async deleteFavorite(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Favorite> {
    return this.favoriteService.deleteFavorite(user.id, id);
  }
}
