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
import { StripeService } from '../stripe/stripe.service';
import { EmailService } from '../email/email.service';
import { CreateBookingInput } from './dto/create-booking.input';
import { CreatePaymentSessionInput } from './dto/create-payment-session.input';
import { ConfirmPaymentInput } from './dto/confirm-payment.input';
import { ReservationStats } from './dto/reservation-stats.dto';
import { AppStats } from './dto/app-stats.dto';
import { ChartData } from './dto/chart-data.dto';
import Stripe from 'stripe';
import { WebhookEventDto } from './dto/webhook-event.dto';
import { PaymentSessionDto } from './dto/payment-session.dto';

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

  async createBooking(
    user: User,
    createBookingInput: CreateBookingInput,
  ): Promise<Booking> {
    try {
      const { propertyId, checkIn, checkOut } = createBookingInput;

      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      this.validateBookingDates(checkInDate, checkOutDate);

      const existingBooking = await this.bookingRepository.findOne({
        where: {
          property: { id: propertyId },
          paymentStatus: true,
          checkIn: checkInDate,
          checkOut: checkOutDate,
        },
      });

      if (existingBooking) {
        throw new BadRequestException(
          'Property is already booked for these dates',
        );
      }

      // Clean up any existing unpaid bookings for this user and property
      await this.bookingRepository.delete({
        user: { id: user.id },
        property: { id: propertyId },
        paymentStatus: false,
      });

      const property = await this.propertyRepository.findOne({
        where: { id: propertyId },
      });

      if (!property) {
        throw new NotFoundException('Property not found');
      }

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

      const errorMessage = this.getErrorMessage(error);
      throw new InternalServerErrorException(
        `Failed to create booking: ${errorMessage}`,
      );
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

  // ========== HOST FUNCTIONALITY ==========

  async getHostReservations(hostId: string): Promise<Booking[]> {
    try {
      return await this.bookingRepository.find({
        where: {
          paymentStatus: true,
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
          orderTotal: true,
          totalNights: true,
          checkIn: true,
          checkOut: true,
          paymentStatus: true,
          createdAt: true,
          updatedAt: true,
          property: {
            id: true,
            name: true,
            price: true,
            country: true,
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
            paymentStatus: true,
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
        .where('booking.paymentStatus = :paymentStatus', {
          paymentStatus: true,
        })
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
        .andWhere('booking.paymentStatus = :paymentStatus', {
          paymentStatus: true,
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

  async createPaymentSession(
    userId: string,
    createPaymentSessionInput: CreatePaymentSessionInput,
  ): Promise<PaymentSessionDto> {
    const { bookingId } = createPaymentSessionInput;

    try {
      const booking = await this.bookingRepository.findOne({
        where: { id: bookingId, userId },
        relations: ['property', 'user'],
      });

      if (!booking) {
        throw new Error('Booking not found or unauthorized');
      }

      if (booking.paymentStatus) {
        throw new Error('Booking is already paid');
      }

      if (booking.stripeSessionId) {
        const isExpired = await this.stripeService.isSessionExpired(
          booking.stripeSessionId,
        );
        if (!isExpired) {
          const existingSession = await this.stripeService.retrieveSession(
            booking.stripeSessionId,
          );
          if (existingSession.client_secret) {
            return {
              clientSecret: existingSession.client_secret,
              sessionId: existingSession.id,
            };
          }
        }
      }

      const sessionData = await this.stripeService.createCheckoutSession(
        booking.id,
        booking.orderTotal,
        booking.totalNights,
        booking.checkIn,
        booking.checkOut,
        booking.property.name,
        booking.property.image || '',
      );

      booking.stripeSessionId = sessionData.sessionId;
      await this.bookingRepository.save(booking);

      return {
        clientSecret: sessionData.clientSecret,
        sessionId: sessionData.sessionId,
      };
    } catch (error) {
      const errorMessage = this.getErrorMessage(error);
      throw new Error(`Failed to create payment session: ${errorMessage}`);
    }
  }

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

      if (booking.paymentStatus) {
        return booking;
      }

      const paymentIntent = session.payment_intent as Stripe.PaymentIntent;
      if (!paymentIntent) {
        throw new Error('No payment intent found in session');
      }

      booking.paymentStatus = true;
      booking.stripePaymentIntentId = paymentIntent.id;
      booking.paymentCompletedAt = new Date();

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
        where: { id: bookingId, paymentStatus: false },
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
