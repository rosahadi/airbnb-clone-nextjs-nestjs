import {
  Controller,
  Post,
  Res,
  Headers,
  RawBody,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { StripeService } from '../stripe/stripe.service';
import { BookingService } from '../booking/booking.service';

@Controller('webhooks')
export class WebhookController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly bookingService: BookingService,
  ) {}

  @Post('stripe')
  async handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @RawBody() rawBody: Buffer,
    @Res() res: Response,
  ) {
    const startTime = Date.now();

    try {
      if (!signature) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          error: 'Missing stripe-signature header',
        });
      }

      if (!rawBody || rawBody.length === 0) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          error: 'Empty webhook body',
        });
      }

      const event = this.stripeService.constructWebhookEvent(
        rawBody,
        signature,
      );

      const webhookResult =
        await this.bookingService.handleStripeWebhook(event);

      return res.status(HttpStatus.OK).json({
        received: true,
        eventType: event.type,
        eventId: event.id,
        processingTimeMs: Date.now() - startTime,
        result: webhookResult,
      });
    } catch (error: unknown) {
      const processingTime = Date.now() - startTime;

      if (error instanceof BadRequestException) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          error: error.message,
          processingTimeMs: processingTime,
        });
      }

      if (error instanceof Error) {
        return res.status(HttpStatus.OK).json({
          received: true,
          error: error.message,
          processingTimeMs: processingTime,
          note: 'Error logged but returning 200 to prevent retries',
        });
      }

      return res.status(HttpStatus.OK).json({
        received: true,
        error: 'Unknown error occurred',
        processingTimeMs: processingTime,
      });
    }
  }

  @Post('stripe/health')
  webhookHealthCheck(@Res() res: Response) {
    return res.status(HttpStatus.OK).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'stripe-webhook',
    });
  }
}
