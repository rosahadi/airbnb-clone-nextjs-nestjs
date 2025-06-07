import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import { User } from '../users/entities/user.entity';
import { Booking } from '../booking/booking.entity';
import { TypedConfigService } from '../config/typed-config.service';
import { EmailConfig } from '../config/email.config';
import { FrontendConfig } from '../config/frontend.config';

@Injectable()
export class EmailService {
  private resend: Resend;
  private clientURL: string;
  private fromEmail: string;

  constructor(private configService: TypedConfigService) {
    const emailConfig = this.configService.get<EmailConfig>('email');
    const frontendConfig = this.configService.get<FrontendConfig>('frontend');

    if (!emailConfig || !frontendConfig) {
      throw new Error('Missing configuration for email or frontend');
    }

    this.resend = new Resend(emailConfig.resendApiKey);
    this.clientURL = frontendConfig.clientUrl;
    this.fromEmail = emailConfig.fromEmail;
  }

  private async sendEmail({
    to,
    subject,
    html,
  }: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject,
        html,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to send email: ${error.message}`);
      }
      throw new Error('Failed to send email: Unknown error');
    }
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  }

  async sendVerificationEmail(
    user: User,
    verificationToken: string,
  ): Promise<void> {
    const verificationUrl = `${this.clientURL}/verify-email?token=${verificationToken}`;
    const emailContent = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Email Verification</h2>
        <p>Hello ${user.name},</p>
        <p>Click the button below to verify your email:</p>
        <a href="${verificationUrl}" style="background-color:#f43f5e; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Verify Email
        </a>
        <p>Best, <br>Airbnb Team</p>
      </div>
    `;

    await this.sendEmail({
      to: user.email,
      subject: 'Verify Your Email',
      html: emailContent,
    });
  }

  async sendPasswordReset(user: User, resetToken: string): Promise<void> {
    const resetUrl = `${this.clientURL}/reset-password?token=${resetToken}`;
    const emailContent = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Password Reset</h2>
        <p>Hello ${user.name},</p>
        <p>Click the button below to reset your password:</p>
        <a href="${resetUrl}" style="background-color:#f43f5e; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Reset Password
        </a>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best, <br>Airbnb Team</p>
      </div>
    `;

    await this.sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      html: emailContent,
    });
  }

  async sendBookingConfirmation(booking: Booking): Promise<void> {
    if (!booking.user || !booking.property) {
      throw new Error('Booking must include user and property relations');
    }

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <!-- Header -->
        <div style="background-color: #f43f5e; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">🎉 Booking Confirmed!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Your reservation is all set</p>
        </div>

        <!-- Main Content -->
        <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e0e0e0;">
          <p style="font-size: 18px; margin-bottom: 20px;">Hi ${booking.user.name},</p>
          
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            Great news! Your booking has been confirmed and payment has been processed successfully. 
            Get ready for an amazing stay!
          </p>

          <!-- Property Details -->
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="color: #f43f5e; margin-top: 0; font-size: 20px;">📍 Your Destination</h2>
            <h3 style="margin: 0 0 10px 0; font-size: 24px; color: #333;">${booking.property.name}</h3>
            ${booking.property.country ? `<p style="margin: 0; color: #666; font-size: 16px;">${booking.property.country}</p>` : ''}
          </div>

          <!-- Booking Details -->
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="color: #f43f5e; margin-top: 0; font-size: 20px;">📅 Stay Details</h2>
            <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
              <div style="flex: 1;">
                <p style="margin: 0; font-weight: bold; color: #333;">Check-in</p>
                <p style="margin: 5px 0 0 0; font-size: 16px;">${this.formatDate(booking.checkIn)}</p>
              </div>
              <div style="flex: 1; text-align: right;">
                <p style="margin: 0; font-weight: bold; color: #333;">Check-out</p>
                <p style="margin: 5px 0 0 0; font-size: 16px;">${this.formatDate(booking.checkOut)}</p>
              </div>
            </div>
            <div style="text-align: center; padding: 10px; background-color: #fff; border-radius: 6px;">
              <p style="margin: 0; font-weight: bold; font-size: 18px; color: #f43f5e;">
                ${booking.totalNights} night${booking.totalNights > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <!-- Payment Receipt -->
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="color: #f43f5e; margin-top: 0; font-size: 20px;">💳 Payment Receipt</h2>
            
            <div style="border-bottom: 1px solid #e0e0e0; padding-bottom: 15px; margin-bottom: 15px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span>${this.formatCurrency(booking.property.price)} × ${booking.totalNights} nights</span>
                <span>${this.formatCurrency(booking.subTotal)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span>Cleaning fee</span>
                <span>${this.formatCurrency(booking.cleaning)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span>Service fee</span>
                <span>${this.formatCurrency(booking.service)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span>Taxes</span>
                <span>${this.formatCurrency(booking.tax)}</span>
              </div>
            </div>
            
            <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 18px; color: #333;">
              <span>Total</span>
              <span style="color: #f43f5e;">${this.formatCurrency(booking.orderTotal)}</span>
            </div>
            
            <div style="margin-top: 15px; padding: 10px; background-color: #e8f5e8; border-radius: 6px; text-align: center;">
              <span style="color: #28a745; font-weight: bold;">✅ Payment Confirmed</span>
            </div>
          </div>

          <!-- Booking Reference -->
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #ffc107;">
            <p style="margin: 0; font-weight: bold; color: #856404;">Booking Reference</p>
            <p style="margin: 5px 0 0 0; font-family: monospace; font-size: 16px; color: #856404;">${booking.id}</p>
          </div>


          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            We're excited for your upcoming trip! If you have any questions, feel free to contact us.
          </p>

        </div>

        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0; border-top: none;">
          <p style="margin: 0; font-size: 14px; color: #666;">
            This email was sent regarding your booking. Please do not reply to this email.
          </p>
        </div>
      </div>
    `;

    await this.sendEmail({
      to: booking.user.email,
      subject: `Booking Confirmed - ${booking.property.name}`,
      html: emailContent,
    });
  }
}
