import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository, LessThan } from 'typeorm';
import { Booking, BookingStatus } from './booking.entity';
import { Property } from '../property/property.entity';
import { User } from '../users/user.entity';
import { StripeService } from '../stripe/stripe.service';
import { EmailService } from '../email/email.service';
import { CreateBookingWithPaymentInput } from './dto/create-booking-with-payment.input';
import { ConfirmPaymentInput } from './dto/confirm-payment.input';
import { ReservationStats } from './dto/reservation-stats.dto';
import { AppStats } from './dto/app-stats.dto';
import { ChartData } from './dto/chart-data.dto';
import Stripe from 'stripe';
import { WebhookEventDto } from './dto/webhook-event.dto';
import { PaymentSessionDto } from './dto/payment-session.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly stripeService: StripeService,
    private readonly emailService: EmailService,
  ) {}

  private calculateTotals(checkIn: Date, checkOut: Date, price: number) {
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const totalNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const priceInCents = Math.round(price * 100);
    const subTotalInCents = totalNights * priceInCents;

    const cleaningInCents = 10 * 100;
    const serviceInCents = 30 * 100;
    const taxInCents = Math.round(subTotalInCents * 0.1);
    const orderTotalInCents =
      subTotalInCents + cleaningInCents + serviceInCents + taxInCents;

    return {
      totalNights,
      subTotal: subTotalInCents,
      cleaning: cleaningInCents,
      service: serviceInCents,
      tax: taxInCents,
      orderTotal: orderTotalInCents,
    };
  }

  private formatDate(date: Date, monthYear = false): string {
    if (monthYear) {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
      });
    }
    return date.toLocaleDateString();
  }

  private validateBookingDates(checkIn: Date, checkOut: Date): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      throw new BadRequestException('Check-in date cannot be in the past');
    }

    if (checkOut <= checkIn) {
      throw new BadRequestException(
        'Check-out date must be after check-in date',
      );
    }
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return 'Unknown error';
  }

  private getExpirationTime(): Date {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);
    return expiresAt;
  }

  private async checkDateAvailability(
    propertyId: string,
    checkIn: Date,
    checkOut: Date,
    excludeBookingId?: string,
  ): Promise<boolean> {
    let queryBuilder = this.bookingRepository
      .createQueryBuilder('booking')
      .where('booking.propertyId = :propertyId', { propertyId })
      .andWhere('booking.status = :status', { status: BookingStatus.CONFIRMED })
      .andWhere(
        '(booking.checkIn < :checkOut AND booking.checkOut > :checkIn)',
        { checkIn, checkOut },
      );

    if (excludeBookingId) {
      queryBuilder = queryBuilder.andWhere('booking.id != :excludeBookingId', {
        excludeBookingId,
      });
    }

    const overlappingBooking = await queryBuilder.getOne();
    return !overlappingBooking;
  }

  async createBookingWithPayment(
    user: User,
    createBookingInput: CreateBookingWithPaymentInput,
  ): Promise<PaymentSessionDto> {
    try {
      const { propertyId, checkIn, checkOut } = createBookingInput;

      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      this.validateBookingDates(checkInDate, checkOutDate);

      const isAvailable = await this.checkDateAvailability(
        propertyId,
        checkInDate,
        checkOutDate,
      );

      if (!isAvailable) {
        throw new BadRequestException(
          'Property is not available for these dates',
        );
      }

      const property = await this.propertyRepository.findOne({
        where: { id: propertyId },
      });

      if (!property) {
        throw new NotFoundException('Property not found');
      }

      // Clean up any existing expired/pending bookings for this user and property
      await this.cleanupUserPendingBookings(user.id, propertyId);

      const { totalNights, subTotal, cleaning, service, tax, orderTotal } =
        this.calculateTotals(checkInDate, checkOutDate, property.price);

      const newBooking = this.bookingRepository.create({
        checkIn: checkInDate,
        checkOut: checkOutDate,
        totalNights,
        subTotal,
        cleaning,
        service,
        tax,
        orderTotal,
        status: BookingStatus.PENDING_PAYMENT,
        paymentStatus: false,
        expiresAt: this.getExpirationTime(),
        user,
        property,
      });

      const savedBooking = await this.bookingRepository.save(newBooking);

      const sessionData = await this.stripeService.createCheckoutSession(
        savedBooking.id,
        orderTotal,
        totalNights,
        checkInDate,
        checkOutDate,
        property.name,
        property.image || '',
      );

      savedBooking.stripeSessionId = sessionData.sessionId;
      await this.bookingRepository.save(savedBooking);

      return {
        clientSecret: sessionData.clientSecret,
        sessionId: sessionData.sessionId,
        bookingId: savedBooking.id,
      };
    } catch (error: unknown) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      const errorMessage = this.getErrorMessage(error);
      throw new InternalServerErrorException(
        `Failed to create booking: ${errorMessage}`,
      );
    }
  }

  private async cleanupUserPendingBookings(
    userId: string,
    propertyId: string,
  ): Promise<void> {
    await this.bookingRepository.delete({
      user: { id: userId },
      property: { id: propertyId },
      status: BookingStatus.PENDING_PAYMENT,
    });
  }

  // Cleanup expired bookings - runs every 30 minutes
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  @Cron(CronExpression.EVERY_30_MINUTES)
  async cleanupExpiredBookings(): Promise<void> {
    try {
      const expiredBookings = await this.bookingRepository.find({
        where: {
          status: BookingStatus.PENDING_PAYMENT,
          expiresAt: LessThan(new Date()),
        },
      });

      if (expiredBookings.length > 0) {
        await this.bookingRepository.remove(expiredBookings);
        console.log(`Cleaned up ${expiredBookings.length} expired bookings`);
      }
    } catch (error) {
      console.error('Error cleaning up expired bookings:', error);
    }
  }

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
      const errorMessage = this.getErrorMessage(error);
      throw new InternalServerErrorException(
        `Error fetching user bookings: ${errorMessage}`,
      );
    }
  }

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
      const errorMessage = this.getErrorMessage(error);
      throw new InternalServerErrorException(
        `Error fetching booking: ${errorMessage}`,
      );
    }
  }

  async cancelBooking(userId: string, bookingId: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId, user: { id: userId } },
      relations: ['user', 'property'],
    });

    if (!booking) {
      throw new NotFoundException(
        `Booking with ID ${bookingId} not found or you don't have permission to cancel it`,
      );
    }

    // Only allow cancellation of pending or confirmed bookings
    if (
      booking.status === BookingStatus.CANCELLED ||
      booking.status === BookingStatus.COMPLETED
    ) {
      throw new BadRequestException('Cannot cancel this booking');
    }

    booking.status = BookingStatus.CANCELLED;
    return await this.bookingRepository.save(booking);
  }

  // ========== HOST FUNCTIONALITY ==========

  async getHostReservations(hostId: string): Promise<Booking[]> {
    try {
      return await this.bookingRepository.find({
        where: {
          status: BookingStatus.CONFIRMED,
          property: {
            userId: hostId,
          },
        },
        order: {
          createdAt: 'DESC',
        },
        relations: ['property', 'user'],
        select: {
          id: true,
          subTotal: true,
          cleaning: true,
          service: true,
          tax: true,
          orderTotal: true,
          totalNights: true,
          checkIn: true,
          checkOut: true,
          status: true,
          paymentStatus: true,
          createdAt: true,
          updatedAt: true,
          property: {
            id: true,
            name: true,
            tagline: true,
            category: true,
            image: true,
            price: true,
            country: true,
            description: true,
            guests: true,
            bedrooms: true,
            beds: true,
            baths: true,
            amenities: true,
          },
          user: {
            id: true,
            name: true,
            email: true,
          },
        },
      });
    } catch (error) {
      const errorMessage = this.getErrorMessage(error);
      throw new InternalServerErrorException(
        `Error fetching host reservations: ${errorMessage}`,
      );
    }
  }

  async getAppStats(): Promise<AppStats> {
    try {
      const [usersCount, propertiesCount, bookingsCount] = await Promise.all([
        this.userRepository.count(),
        this.propertyRepository.count(),
        this.bookingRepository.count({
          where: {
            status: BookingStatus.CONFIRMED,
          },
        }),
      ]);

      return {
        usersCount,
        propertiesCount,
        bookingsCount,
      };
    } catch (error) {
      const errorMessage = this.getErrorMessage(error);
      throw new InternalServerErrorException(
        `Error fetching app stats: ${errorMessage}`,
      );
    }
  }

  async getChartsData(): Promise<ChartData[]> {
    try {
      const date = new Date();
      date.setMonth(date.getMonth() - 6);
      const sixMonthsAgo = date;

      const bookings = await this.bookingRepository
        .createQueryBuilder('booking')
        .where('booking.status = :status', { status: BookingStatus.CONFIRMED })
        .andWhere('booking.createdAt >= :sixMonthsAgo', { sixMonthsAgo })
        .orderBy('booking.createdAt', 'ASC')
        .getMany();

      const bookingsPerMonth = bookings.reduce((total, current) => {
        const date = this.formatDate(current.createdAt, true);
        const existingEntry = total.find((entry) => entry.date === date);
        if (existingEntry) {
          existingEntry.count += 1;
        } else {
          total.push({ date, count: 1 });
        }
        return total;
      }, [] as ChartData[]);

      return bookingsPerMonth;
    } catch (error) {
      const errorMessage = this.getErrorMessage(error);
      throw new InternalServerErrorException(
        `Error fetching charts data: ${errorMessage}`,
      );
    }
  }

  async getHostReservationStats(hostId: string): Promise<ReservationStats> {
    try {
      const properties = await this.propertyRepository.count({
        where: {
          userId: hostId,
        },
      });

      const totals = await this.bookingRepository
        .createQueryBuilder('booking')
        .select('SUM(booking.orderTotal)', 'totalAmount')
        .addSelect('SUM(booking.totalNights)', 'totalNights')
        .innerJoin('booking.property', 'property')
        .where('property.userId = :hostId', { hostId })
        .andWhere('booking.status = :status', {
          status: BookingStatus.CONFIRMED,
        })
        .getRawOne<{
          totalAmount: string | null;
          totalNights: string | null;
        }>();

      return {
        properties,
        nights: totals?.totalNights ? parseInt(totals.totalNights, 10) : 0,
        amount: totals?.totalAmount ? parseInt(totals.totalAmount, 10) : 0,
      };
    } catch (error) {
      const errorMessage = this.getErrorMessage(error);
      throw new InternalServerErrorException(
        `Error fetching host reservation stats: ${errorMessage}`,
      );
    }
  }

  // ========== PAYMENT FUNCTIONALITY ==========

  async confirmPayment(
    confirmPaymentInput: ConfirmPaymentInput,
  ): Promise<Booking> {
    const { sessionId } = confirmPaymentInput;

    try {
      const session = await this.stripeService.getSessionDetails(sessionId);

      if (!session) {
        throw new Error('Session not found');
      }

      if (session.status !== 'complete') {
        throw new Error(`Session is not complete. Status: ${session.status}`);
      }

      if (session.payment_status !== 'paid') {
        throw new Error(
          `Payment not completed. Status: ${session.payment_status}`,
        );
      }

      const booking = await this.bookingRepository.findOne({
        where: { stripeSessionId: sessionId },
        relations: ['user', 'property'],
      });

      if (!booking) {
        throw new Error('Booking not found for this session');
      }

      if (booking.status === BookingStatus.CONFIRMED) {
        return booking;
      }

      const paymentIntent = session.payment_intent as Stripe.PaymentIntent;
      if (!paymentIntent) {
        throw new Error('No payment intent found in session');
      }

      // Final availability check before confirming
      const isStillAvailable = await this.checkDateAvailability(
        booking.property.id,
        booking.checkIn,
        booking.checkOut,
        booking.id,
      );

      if (!isStillAvailable) {
        // Cancel the booking and refund if property is no longer available
        booking.status = BookingStatus.CANCELLED;
        await this.bookingRepository.save(booking);
        throw new Error('Property is no longer available for these dates');
      }

      booking.status = BookingStatus.CONFIRMED;
      booking.paymentStatus = true;
      booking.stripePaymentIntentId = paymentIntent.id;
      booking.paymentCompletedAt = new Date();
      booking.expiresAt = undefined;

      const updatedBooking = await this.bookingRepository.save(booking);

      this.emailService.sendBookingConfirmation(updatedBooking).catch(() => {
        // Email error handled silently
      });

      return updatedBooking;
    } catch (error) {
      const errorMessage = this.getErrorMessage(error);
      throw new Error(`Payment confirmation failed: ${errorMessage}`);
    }
  }

  async handleStripeWebhook(event: Stripe.Event): Promise<WebhookEventDto> {
    const webhookEvent: WebhookEventDto = {
      type: event.type,
      timestamp: new Date(),
    };

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;
          const bookingId = session.metadata?.bookingId;

          webhookEvent.bookingId = bookingId;
          webhookEvent.sessionId = session.id;

          if (bookingId && session.payment_status === 'paid') {
            try {
              await this.confirmPayment({ sessionId: session.id });
            } catch (error) {
              if (
                error instanceof BadRequestException &&
                this.getErrorMessage(error).includes('already')
              ) {
                // Booking already confirmed, skip
              } else {
                throw error;
              }
            }
          } else if (!bookingId) {
            const errorMsg = 'Missing booking ID in session metadata';
            webhookEvent.error = errorMsg;
          } else if (session.payment_status !== 'paid') {
            const errorMsg = `Session completed but payment not confirmed: ${session.payment_status}`;
            webhookEvent.error = errorMsg;
          }
          break;
        }

        case 'checkout.session.expired': {
          const expiredSession = event.data.object;
          webhookEvent.bookingId = expiredSession.metadata?.bookingId;
          webhookEvent.sessionId = expiredSession.id;
          webhookEvent.error = 'Checkout session expired';

          if (expiredSession.metadata?.bookingId) {
            await this.cleanupExpiredBooking(expiredSession.metadata.bookingId);
          }
          break;
        }

        case 'payment_intent.payment_failed': {
          const paymentIntent = event.data.object;
          webhookEvent.paymentIntentId = paymentIntent.id;
          const errorMsg = `Payment failed: ${paymentIntent.last_payment_error?.message || 'Unknown error'}`;
          webhookEvent.error = errorMsg;
          break;
        }

        case 'payment_intent.requires_action': {
          const actionRequired = event.data.object;
          webhookEvent.paymentIntentId = actionRequired.id;
          webhookEvent.error = 'Payment requires additional action';
          break;
        }

        case 'payment_intent.succeeded': {
          const succeededIntent = event.data.object;
          webhookEvent.paymentIntentId = succeededIntent.id;
          break;
        }

        default: {
          const unhandledMsg = `Unhandled event type: ${event.type}`;
          webhookEvent.error = unhandledMsg;
          break;
        }
      }

      return webhookEvent;
    } catch (error: unknown) {
      const errorMsg = this.getErrorMessage(error);
      webhookEvent.error = errorMsg;
      throw error;
    }
  }

  private async cleanupExpiredBooking(bookingId: string): Promise<void> {
    try {
      const booking = await this.bookingRepository.findOne({
        where: { id: bookingId, status: BookingStatus.PENDING_PAYMENT },
      });

      if (booking) {
        await this.bookingRepository.remove(booking);
      }
    } catch {
      // Cleanup error handled silently
    }
  }

  async findBookingBySessionId(sessionId: string): Promise<Booking | null> {
    try {
      return await this.bookingRepository.findOne({
        where: { stripeSessionId: sessionId },
        relations: ['user', 'property'],
      });
    } catch {
      return null;
    }
  }
}
