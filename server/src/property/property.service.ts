import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Property } from './property.entity';
import { User } from '../users/user.entity';
import { Booking, BookingStatus } from '../booking/booking.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreatePropertyInput } from './dto/create-property.input';
import { UpdatePropertyInput } from './dto/update-property.input';
import { PropertyFilterInput } from './dto/property-filter.input';
import { PropertySearchInput } from './dto/property-search.input';

@Injectable()
export class PropertyService {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async searchProperties(
    searchInput?: PropertySearchInput,
  ): Promise<Property[]> {
    const queryBuilder = this.propertyRepository.createQueryBuilder('property');

    if (searchInput?.country) {
      queryBuilder.andWhere('LOWER(property.country) LIKE LOWER(:country)', {
        country: `%${searchInput.country}%`,
      });
    }

    if (searchInput?.guests) {
      queryBuilder.andWhere('property.guests >= :guests', {
        guests: searchInput.guests,
      });
    }

    if (searchInput?.checkIn && searchInput?.checkOut) {
      const checkIn = new Date(searchInput.checkIn);
      const checkOut = new Date(searchInput.checkOut);

      const conflictingBookings = this.bookingRepository
        .createQueryBuilder('booking')
        .select('booking.propertyId')
        .where('booking.status IN (:...statuses)', {
          statuses: [BookingStatus.CONFIRMED, BookingStatus.PENDING_PAYMENT],
        })
        .andWhere('booking.checkIn <= :checkOut', { checkOut })
        .andWhere('booking.checkOut >= :checkIn', { checkIn });

      queryBuilder
        .andWhere(`property.id NOT IN (${conflictingBookings.getQuery()})`)
        .setParameters(conflictingBookings.getParameters());
    }

    queryBuilder.orderBy('property.createdAt', 'DESC');

    return queryBuilder.getMany();
  }
  async createProperty(
    user: User,
    createPropertyInput: CreatePropertyInput,
  ): Promise<Property> {
    try {
      let imageUrl: string;

      const { image } = createPropertyInput;

      if (typeof image === 'string') {
        const imageBuffer = Buffer.from(image, 'base64');
        const uploadedImage = await this.cloudinaryService.uploadPropertyImage(
          imageBuffer,
          `property-${Date.now()}`,
        );
        imageUrl = uploadedImage.url;
      } else {
        throw new BadRequestException('Property image is required');
      }

      const newProperty = this.propertyRepository.create({
        ...(createPropertyInput as DeepPartial<Property>),
        image: imageUrl,
        user,
        userId: user.id,
      });

      return await this.propertyRepository.save(newProperty);
    } catch (error: unknown) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(
        `Failed to create property: ${errorMessage}`,
      );
    }
  }

  // Find all properties with optional filters
  async findAllProperties(filters?: PropertyFilterInput): Promise<Property[]> {
    const queryBuilder = this.propertyRepository.createQueryBuilder('property');

    if (filters?.category) {
      queryBuilder.andWhere('property.category = :category', {
        category: filters.category,
      });
    }

    queryBuilder.orderBy('property.createdAt', 'DESC');

    return queryBuilder.getMany();
  }

  // Find property by ID
  async findPropertyById(id: string): Promise<Property> {
    try {
      const property = await this.propertyRepository.findOne({
        where: { id },
        relations: [
          'user',
          'favorites',
          'favorites.user',
          'reviews',
          'bookings',
        ],
      });

      if (!property) {
        throw new NotFoundException(`Property with ID ${id} not found`);
      }

      return property;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(
        `Error fetching property: ${errorMessage}`,
      );
    }
  }

  async updateProperty(
    userId: string,
    propertyId: string,
    updatePropertyInput: UpdatePropertyInput,
  ): Promise<Property> {
    const property = await this.propertyRepository.findOne({
      where: { id: propertyId, userId },
      relations: ['user', 'favorites', 'reviews', 'bookings'],
    });

    if (!property) {
      throw new NotFoundException(
        `Property with ID ${propertyId} not found or you don't have permission to update it`,
      );
    }

    // Handle image update if provided
    if (updatePropertyInput.image) {
      try {
        // Convert base64 string to buffer
        const imageBuffer = Buffer.from(updatePropertyInput.image, 'base64');

        // Upload to Cloudinary
        const uploadedImage = await this.cloudinaryService.uploadPropertyImage(
          imageBuffer,
          `property-${propertyId}-${Date.now()}`,
        );

        property.image = uploadedImage.url;

        // Remove image from the input to avoid double setting
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { image: _, ...restOfInput } = updatePropertyInput;
        updatePropertyInput = restOfInput as UpdatePropertyInput;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        throw new BadRequestException(
          `Failed to upload property image: ${errorMessage}`,
        );
      }
    }

    Object.assign(property, updatePropertyInput);
    return await this.propertyRepository.save(property);
  }

  // Delete property
  async deleteProperty(userId: string, propertyId: string): Promise<Property> {
    const property = await this.propertyRepository.findOne({
      where: { id: propertyId, userId },
      relations: ['user'],
    });

    if (!property) {
      throw new NotFoundException(
        `Property with ID ${propertyId} not found or you don't have permission to delete it`,
      );
    }

    const deletedProperty = { ...property };
    await this.propertyRepository.remove(property);
    return deletedProperty;
  }

  // Get user's properties
  async getUserProperties(userId: string): Promise<Property[]> {
    return this.propertyRepository.find({
      where: { userId },
      relations: ['user'],
    });
  }
}
