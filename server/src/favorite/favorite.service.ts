import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './favorite.entity';
import { User } from '../users/user.entity';
import { PropertyService } from '../property/property.service';
import { FavoriteStatusResponse } from './dto/favorite-status.response';

@Injectable()
export class FavoriteService {
  private readonly logger = new Logger(FavoriteService.name);

  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
    private readonly propertyService: PropertyService,
  ) {}

  async toggleFavorite(
    user: User,
    propertyId: string,
  ): Promise<Favorite | null> {
    try {
      // First, verify we have a valid user
      if (!user || !user.id) {
        throw new UnauthorizedException(
          'Valid user required to toggle favorites',
        );
      }

      this.logger.log(
        `Toggling favorite for property ID: ${propertyId} and user: ${user.id}`,
      );

      // Check if property exists
      const property = await this.propertyService.findPropertyById(propertyId);

      // Check if favorite already exists
      const existingFavorite = await this.favoriteRepository.findOne({
        where: {
          user: { id: user.id },
          property: { id: propertyId },
        },
        relations: ['user', 'property'],
      });

      // If favorite exists, remove it
      if (existingFavorite) {
        await this.favoriteRepository.remove(existingFavorite);
        return null;
      }

      // Otherwise create new favorite
      const favorite = this.favoriteRepository.create({
        user,
        property,
      });

      const savedFavorite = await this.favoriteRepository.save(favorite);

      // Now fetch the favorite with full relations to ensure all fields are populated
      return await this.favoriteRepository.findOne({
        where: { id: savedFavorite.id },
        relations: ['user', 'property'],
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(
        `Failed to toggle favorite: ${errorMessage}`,
      );
    }
  }

  async getUserFavorites(userId: string): Promise<Favorite[]> {
    if (!userId) {
      throw new UnauthorizedException(
        'Valid user ID required to get favorites',
      );
    }

    try {
      return await this.favoriteRepository.find({
        where: { user: { id: userId } },
        relations: ['user', 'property'],
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(
        `Failed to get user favorites: ${errorMessage}`,
      );
    }
  }

  async getFavoriteById(id: string): Promise<Favorite> {
    const favorite = await this.favoriteRepository.findOne({
      where: { id },
      relations: ['user', 'property'],
    });

    if (!favorite) {
      throw new NotFoundException(`Favorite with ID ${id} not found`);
    }

    return favorite;
  }

  async checkFavoriteStatus(
    userId: string,
    propertyId: string,
  ): Promise<FavoriteStatusResponse> {
    if (!userId) {
      return { isFavorite: false };
    }

    try {
      const favorite = await this.favoriteRepository.findOne({
        where: {
          user: { id: userId },
          property: { id: propertyId },
        },
        select: ['id'],
      });

      return {
        isFavorite: !!favorite,
        favoriteId: favorite?.id || undefined,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(
        `Failed to check favorite status: ${errorMessage}`,
      );
    }
  }

  async deleteFavorite(userId: string, favoriteId: string): Promise<Favorite> {
    if (!userId) {
      throw new UnauthorizedException(
        'Valid user ID required to delete a favorite',
      );
    }

    const favorite = await this.favoriteRepository.findOne({
      where: {
        id: favoriteId,
        user: { id: userId },
      },
      relations: ['user', 'property'],
    });

    if (!favorite) {
      throw new NotFoundException(
        `Favorite with ID ${favoriteId} not found or you don't have permission to delete it`,
      );
    }

    const deletedFavorite = { ...favorite };
    await this.favoriteRepository.remove(favorite);
    return deletedFavorite;
  }
}
