import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { SignupInput } from './dto/signup.input';
import { LoginInput } from './dto/login.input';
import { UpdatePasswordInput } from './dto/update-password.input';
import { ResetPasswordInput } from './dto/reset-password.input';
import { EmailService } from '../email/email.service';
import { User } from '../users/user.entity';
import { PasswordService } from './password.service';
import { TokenUtils } from './utils/token.utils';

interface VerificationTokenPayload {
  email: string;
  sub: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
    private passwordService: PasswordService,
    private tokenUtils: TokenUtils,
  ) {}

  async signup(signupInput: SignupInput): Promise<{ message: string }> {
    // Check if password and passwordConfirm match
    if (signupInput.password !== signupInput.passwordConfirm) {
      throw new BadRequestException('Passwords do not match');
    }

    // Check if user with this email already exists
    const existingUser = await this.usersService.findByEmail(signupInput.email);
    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    // Set expiration time for email verification (15 minutes)
    const expiresDate = new Date();
    expiresDate.setMinutes(expiresDate.getMinutes() + 15);

    // Create new user with expiration date
    const user = await this.usersService.create({
      name: signupInput.name,
      email: signupInput.email,
      password: signupInput.password,
      isEmailVerified: false,
      emailVerificationExpires: expiresDate,
    });

    // Generate verification token
    const verificationToken = this.generateVerificationToken(user);

    // Send verification email
    await this.emailService.sendVerificationEmail(user, verificationToken);

    return {
      message: 'Please check your email for verification link',
    };
  }

  async verifyEmail(token: string): Promise<{ token: string; user: User }> {
    try {
      // Verify and decode the token
      const decoded = this.jwtService.verify<VerificationTokenPayload>(token);

      // Find user by ID from token
      const user = await this.usersService.findById(decoded.sub);

      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }

      // Check if verification period has expired
      if (
        user.emailVerificationExpires &&
        user.emailVerificationExpires < new Date()
      ) {
        // User verification has expired we'll delete the user and throw an exception
        await this.usersService.remove(user.id);
        throw new UnauthorizedException(
          'Verification link has expired. Please sign up again.',
        );
      }

      // Update user's email verification status
      await this.usersService.update(user.id, {
        isEmailVerified: true,
        emailVerificationExpires: undefined,
      });

      // Fetch updated user
      const updatedUser = await this.usersService.findById(user.id);

      // Generate new token
      const newToken = this.generateToken(updatedUser);

      return { token: newToken, user: updatedUser };
    } catch (error) {
      // Handle specific error for expired token
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async login(loginInput: LoginInput): Promise<{ token: string; user: User }> {
    const user = await this.usersService.findByEmail(loginInput.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify password using PasswordService
    const isPasswordValid = await this.passwordService.verify(
      loginInput.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException(
        'Email not verified. Please verify your email before logging in.',
      );
    }

    const token = this.generateToken(user);

    return { token, user };
  }

  async updatePassword(
    userId: string,
    updatePasswordInput: UpdatePasswordInput,
  ): Promise<{ token: string; user: User }> {
    const user = await this.usersService.findById(userId);

    // Check if current password is correct using PasswordService
    const isCurrentPasswordValid = await this.passwordService.verify(
      updatePasswordInput.currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Check if new passwords match
    if (updatePasswordInput.password !== updatePasswordInput.passwordConfirm) {
      throw new BadRequestException('Passwords do not match');
    }

    // Update password - hashing handled by UsersService
    await this.usersService.update(userId, {
      password: updatePasswordInput.password,
    });

    // Fetch updated user
    const updatedUser = await this.usersService.findById(userId);

    // Generate new token
    const token = this.generateToken(updatedUser);

    return { token, user: updatedUser };
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('No user found with this email');
    }

    // Generate reset token
    const resetToken = user.createPasswordResetToken();
    await this.usersService.update(user.id, user);

    // Send email with reset token
    await this.emailService.sendPasswordReset(user, resetToken);
  }

  async resetPassword(
    resetPasswordInput: ResetPasswordInput,
  ): Promise<{ token: string; user: User }> {
    // Check if passwords match
    if (resetPasswordInput.password !== resetPasswordInput.passwordConfirm) {
      throw new BadRequestException('Passwords do not match');
    }

    // Get user by reset token
    const user = await this.usersService.findByPasswordResetToken(
      resetPasswordInput.token,
    );
    if (!user) {
      throw new BadRequestException('Token is invalid or has expired');
    }

    // Update password and clear reset token - hashing handled by UsersService
    await this.usersService.update(user.id, {
      password: resetPasswordInput.password,
      passwordResetToken: undefined,
      passwordResetExpires: undefined,
    });

    // Fetch updated user
    const updatedUser = await this.usersService.findById(user.id);

    // Generate new token
    const token = this.generateToken(updatedUser);

    return { token, user: updatedUser };
  }

  private generateToken(user: User): string {
    const payload = { email: user.email, sub: user.id, roles: user.roles };
    return this.jwtService.sign(payload);
  }

  private generateVerificationToken(user: User): string {
    const payload = { email: user.email, sub: user.id };
    return this.jwtService.sign(payload, {
      expiresIn: '15m',
    });
  }
}
