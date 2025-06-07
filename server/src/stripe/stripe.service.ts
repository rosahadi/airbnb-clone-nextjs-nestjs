import { Injectable, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import Stripe from 'stripe';
import { stripeConfig } from '../config/stripe.config';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    @Inject(stripeConfig.KEY)
    private config: ConfigType<typeof stripeConfig>,
  ) {
    this.stripe = new Stripe(this.config.secretKey, {
      apiVersion: this.config.apiVersion as Stripe.LatestApiVersion,
    });
  }

  constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event {
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      this.config.webhookSecret,
    );
  }

  async createCheckoutSession(
    bookingId: string,
    orderTotal: number,
    totalNights: number,
    checkIn: Date,
    checkOut: Date,
    propertyName: string,
    propertyImage: string,
  ): Promise<{ clientSecret: string; sessionId: string }> {
    try {
      const session = await this.stripe.checkout.sessions.create({
        ui_mode: 'embedded',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `${propertyName} - ${totalNights} nights`,
                description: `Check-in: ${checkIn.toDateString()}, Check-out: ${checkOut.toDateString()}`,
                images: propertyImage ? [propertyImage] : [],
              },
              unit_amount: orderTotal, // Already in cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        metadata: {
          bookingId,
        },
        expires_at: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
        customer_creation: 'if_required',
        automatic_tax: {
          enabled: false,
        },
        redirect_on_completion: 'never',
      });

      if (!session.client_secret) {
        throw new Error(
          'Failed to create payment session: missing client secret',
        );
      }

      return {
        clientSecret: session.client_secret,
        sessionId: session.id,
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to create payment session: ${error.message}`);
      }
      throw new Error('Failed to create payment session: unknown error');
    }
  }
  async retrieveSession(sessionId: string): Promise<Stripe.Checkout.Session> {
    return this.stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'payment_intent'],
    });
  }

  async createRefund(
    paymentIntentId: string,
    reason?: Stripe.RefundCreateParams.Reason,
    amount?: number,
  ): Promise<Stripe.Refund> {
    const refundParams: Stripe.RefundCreateParams = {
      payment_intent: paymentIntentId,
    };

    if (amount) {
      refundParams.amount = Math.round(amount * 100);
    }

    if (reason) {
      refundParams.reason = reason;
    }

    return this.stripe.refunds.create(refundParams);
  }

  async retrievePaymentIntent(
    paymentIntentId: string,
  ): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.retrieve(paymentIntentId);
  }

  async listRefunds(
    paymentIntentId: string,
  ): Promise<Stripe.ApiList<Stripe.Refund>> {
    return this.stripe.refunds.list({
      payment_intent: paymentIntentId,
    });
  }

  async getSessionDetails(sessionId: string): Promise<Stripe.Checkout.Session> {
    return this.stripe.checkout.sessions.retrieve(sessionId, {
      expand: [
        'line_items',
        'line_items.data.price.product',
        'payment_intent',
        'payment_intent.payment_method',
        'customer',
      ],
    });
  }

  async isSessionExpired(sessionId: string): Promise<boolean> {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);
      return session.status === 'expired';
    } catch {
      return true;
    }
  }

  async checkSessionCompletion(sessionId: string): Promise<{
    isComplete: boolean;
    isPaid: boolean;
    session: Stripe.Checkout.Session;
  }> {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['payment_intent'],
      });

      return {
        isComplete: session.status === 'complete',
        isPaid: session.payment_status === 'paid',
        session,
      };
    } catch (error) {
      throw new Error(
        `Failed to check session completion: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
