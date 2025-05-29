import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Booking } from './booking.entity';
import { Property } from '../property/entities/property.entity';
import { User } from '../users/entities/user.entity';
import { CreateBookingInput } from './dto/create-booking.input';
import { UpdateBookingInput } from './dto/update-booking.input';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
  ) {}

  private calculateTotals(
    checkIn: Date,
    checkOut: Date,
    price: number,
  ): {
    orderTotal: number;
    totalNights: number;
  } {
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const totalNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const orderTotal = totalNights * price;

    return { orderTotal, totalNights };
  }

  async createBooking(
    user: User,
    createBookingInput: CreateBookingInput,
  ): Promise<Booking> {
    try {
      const { propertyId, checkIn, checkOut } = createBookingInput;

      // Delete any existing unpaid bookings for this user AND this specific property
      await this.bookingRepository.delete({
        user: { id: user.id },
        property: { id: propertyId },
        paymentStatus: false,
      });

      // Find the property
      const property = await this.propertyRepository.findOne({
        where: { id: propertyId },
      });

      if (!property) {
        throw new NotFoundException('Property not found');
      }

      // Validate dates
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (checkInDate < today) {
        throw new BadRequestException('Check-in date cannot be in the past');
      }

      if (checkOutDate <= checkInDate) {
        throw new BadRequestException(
          'Check-out date must be after check-in date',
        );
      }

      // Calculate totals
      const { orderTotal, totalNights } = this.calculateTotals(
        checkInDate,
        checkOutDate,
        property.price,
      );

      // Create the booking
      const newBooking = this.bookingRepository.create({
        checkIn: checkInDate,
        checkOut: checkOutDate,
        orderTotal,
        totalNights,
        paymentStatus: false,
        user,
        property,
      });

      const savedBooking = await this.bookingRepository.save(newBooking);

      const booking = await this.bookingRepository.findOne({
        where: { id: savedBooking.id },
        relations: ['user', 'property'],
      });

      if (!booking) {
        throw new NotFoundException(
          `Booking with ID ${savedBooking.id} not found`,
        );
      }

      return booking;
    } catch (error: unknown) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(
        `Failed to create booking: ${errorMessage}`,
      );
    }
  }

  // Get user's bookings
  async getUserBookings(userId: string): Promise<Booking[]> {
    try {
      return await this.bookingRepository.find({
        where: {
          user: { id: userId },
        },
        relations: ['property'],
        order: {
          checkIn: 'DESC',
        },
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(
        `Error fetching user bookings: ${errorMessage}`,
      );
    }
  }

  // Find booking by ID
  async findBookingById(id: string, userId?: string): Promise<Booking> {
    try {
      const whereCondition: FindOptionsWhere<Booking> = { id };
      if (userId) {
        whereCondition.user = { id: userId };
      }

      const booking = await this.bookingRepository.findOne({
        where: whereCondition,
        relations: ['user', 'property'],
      });

      if (!booking) {
        throw new NotFoundException(`Booking with ID ${id} not found`);
      }

      return booking;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(
        `Error fetching booking: ${errorMessage}`,
      );
    }
  }

  // Update booking (for payment status or other updates)
  async updateBooking(
    userId: string,
    bookingId: string,
    updateBookingInput: UpdateBookingInput,
  ): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId, user: { id: userId } },
      relations: ['user', 'property'],
    });

    if (!booking) {
      throw new NotFoundException(
        `Booking with ID ${bookingId} not found or you don't have permission to update it`,
      );
    }

    Object.assign(booking, updateBookingInput);
    return await this.bookingRepository.save(booking);
  }

  // Delete booking
  async deleteBooking(userId: string, bookingId: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId, user: { id: userId } },
      relations: ['user', 'property'],
    });

    if (!booking) {
      throw new NotFoundException(
        `Booking with ID ${bookingId} not found or you don't have permission to delete it`,
      );
    }

    const deletedBooking = { ...booking };
    await this.bookingRepository.remove(booking);
    return deletedBooking;
  }
}
