import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { BookingService } from './booking.service';
import { Booking } from './booking.entity';
import { User } from '../users/entities/user.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { VerifiedEmailGuard } from '../auth/guards/verified-email.guard';
import { CreateBookingInput } from './dto/create-booking.input';
import {
  ReservationStats,
  ReservationStatsDto,
} from './dto/reservation-stats.dto';
import { AppStats, AppStatsDto } from './dto/app-stats.dto';
import { ChartData, ChartDataDto } from './dto/chart-data.dto';
import { PaymentSessionDto } from './dto/payment-session.dto';
import { CreatePaymentSessionInput } from './dto/create-payment-session.input';
import { ConfirmPaymentInput } from './dto/confirm-payment.input';

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

  @Query(() => Booking, { nullable: true })
  @UseGuards(VerifiedEmailGuard)
  async bookingBySessionId(
    @Args('sessionId') sessionId: string,
  ): Promise<Booking | null> {
    return this.bookingService.findBookingBySessionId(sessionId);
  }

  // ---- Host Reservations ----

  @Query(() => [Booking])
  @UseGuards(VerifiedEmailGuard)
  async hostReservations(@CurrentUser() user: User): Promise<Booking[]> {
    return this.bookingService.getHostReservations(user.id);
  }

  @Query(() => ReservationStatsDto)
  @UseGuards(VerifiedEmailGuard)
  async hostReservationStats(
    @CurrentUser() user: User,
  ): Promise<ReservationStats> {
    return this.bookingService.getHostReservationStats(user.id);
  }

  // ---- App Statistics ----

  @Query(() => AppStatsDto)
  @UseGuards(VerifiedEmailGuard)
  async appStats(): Promise<AppStats> {
    return this.bookingService.getAppStats();
  }

  @Query(() => [ChartDataDto])
  @UseGuards(VerifiedEmailGuard)
  async chartsData(): Promise<ChartData[]> {
    return this.bookingService.getChartsData();
  }

  // ---- Mutations ----

  @Mutation(() => Booking)
  @UseGuards(VerifiedEmailGuard)
  async createBooking(
    @CurrentUser() user: User,
    @Args('createBookingInput') createBookingInput: CreateBookingInput,
  ): Promise<Booking> {
    return this.bookingService.createBooking(user, createBookingInput);
  }

  @Mutation(() => Booking)
  @UseGuards(VerifiedEmailGuard)
  async deleteBooking(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Booking> {
    return this.bookingService.deleteBooking(user.id, id);
  }

  @Mutation(() => PaymentSessionDto)
  @UseGuards(VerifiedEmailGuard)
  async createPaymentSession(
    @CurrentUser() user: User,
    @Args('createPaymentSessionInput')
    createPaymentSessionInput: CreatePaymentSessionInput,
  ): Promise<PaymentSessionDto> {
    console.log('createPaymentSession called with:', createPaymentSessionInput);
    console.log('User:', user);

    return this.bookingService.createPaymentSession(
      user.id,
      createPaymentSessionInput,
    );
  }

  @Mutation(() => Booking)
  @UseGuards(VerifiedEmailGuard)
  async confirmPayment(
    @Args('confirmPaymentInput') confirmPaymentInput: ConfirmPaymentInput,
  ): Promise<Booking> {
    return this.bookingService.confirmPayment(confirmPaymentInput);
  }
}
