import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { BookingService } from './booking.service';
import { Booking } from './booking.entity';
import { User } from '../users/entities/user.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { VerifiedEmailGuard } from '../auth/guards/verified-email.guard';
import { CreateBookingInput } from './dto/create-booking.input';
import { UpdateBookingInput } from './dto/update-booking.input';

@Resolver(() => Booking)
export class BookingResolver {
  constructor(private readonly bookingService: BookingService) {}

  // ---- Queries ----

  @Query(() => [Booking])
  @UseGuards(VerifiedEmailGuard)
  async myBookings(@CurrentUser() user: User): Promise<Booking[]> {
    return this.bookingService.getUserBookings(user.id);
  }

  @Query(() => Booking)
  @UseGuards(VerifiedEmailGuard)
  async booking(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Booking> {
    return this.bookingService.findBookingById(id, user.id);
  }

  // ---- Mutations ----

  @Mutation(() => Booking)
  @UseGuards(VerifiedEmailGuard)
  async createBooking(
    @CurrentUser() user: User,
    @Args('createBookingInput') createBookingInput: CreateBookingInput,
  ): Promise<Booking> {
    console.log(createBookingInput);
    return this.bookingService.createBooking(user, createBookingInput);
  }

  @Mutation(() => Booking)
  @UseGuards(VerifiedEmailGuard)
  async updateBooking(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
    @Args('updateBookingInput') updateBookingInput: UpdateBookingInput,
  ): Promise<Booking> {
    return this.bookingService.updateBooking(user.id, id, updateBookingInput);
  }

  @Mutation(() => Booking)
  @UseGuards(VerifiedEmailGuard)
  async deleteBooking(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Booking> {
    return this.bookingService.deleteBooking(user.id, id);
  }
}
