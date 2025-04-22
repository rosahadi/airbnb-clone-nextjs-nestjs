import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { AuthResponse } from './dto/auth-response.dto';
import { SignupInput } from './dto/signup.input';
import { LoginInput } from './dto/login.input';
import { ForgotPasswordInput } from './dto/forgot-password.input';
import { ResetPasswordInput } from './dto/reset-password.input';
import { UpdatePasswordInput } from './dto/update-password.input';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { Public } from './decorators/public.decorator';
import { SignupResponse } from './dto/signup-response.dto';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Mutation(() => SignupResponse)
  async signup(
    @Args('signupInput') signupInput: SignupInput,
  ): Promise<SignupResponse> {
    return this.authService.signup(signupInput);
  }

  @Public()
  @Mutation(() => AuthResponse)
  async verifyEmail(@Args('token') token: string): Promise<AuthResponse> {
    return this.authService.verifyEmail(token);
  }

  @Public()
  @Mutation(() => AuthResponse)
  async login(
    @Args('loginInput') loginInput: LoginInput,
  ): Promise<AuthResponse> {
    return this.authService.login(loginInput);
  }

  @Mutation(() => AuthResponse)
  async updatePassword(
    @CurrentUser() user: User,
    @Args('updatePasswordInput') updatePasswordInput: UpdatePasswordInput,
  ): Promise<AuthResponse> {
    return this.authService.updatePassword(user.id, updatePasswordInput);
  }

  @Public()
  @Mutation(() => Boolean)
  async forgotPassword(
    @Args('forgotPasswordInput') forgotPasswordInput: ForgotPasswordInput,
  ): Promise<boolean> {
    await this.authService.forgotPassword(forgotPasswordInput.email);
    return true;
  }

  @Public()
  @Mutation(() => AuthResponse)
  async resetPassword(
    @Args('resetPasswordInput') resetPasswordInput: ResetPasswordInput,
  ): Promise<AuthResponse> {
    return this.authService.resetPassword(resetPasswordInput);
  }

  @Mutation(() => Boolean)
  // eslint-disable-next-line @typescript-eslint/require-await
  async logout(): Promise<boolean> {
    return true;
  }
}
