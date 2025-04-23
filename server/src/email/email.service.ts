import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import { User } from '../users/entities/user.entity';
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
        <a href="${verificationUrl}" style="background-color:rgb(76, 120, 175); color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
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
        <a href="${resetUrl}" style="background-color:rgb(76, 120, 175); color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
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
}
