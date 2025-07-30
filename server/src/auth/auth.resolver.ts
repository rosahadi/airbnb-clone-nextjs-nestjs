import { Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { AuthResponse } from './dto/auth-response.dto';
import { SignupInput } from './dto/signup.input';
import { LoginInput } from './dto/login.input';
import { ForgotPasswordInput } from './dto/forgot-password.input';
import { ResetPasswordInput } from './dto/reset-password.input';
import { UpdatePasswordInput } from './dto/update-password.input';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { Public } from './decorators/public.decorator';
import { SignupResponse } from './dto/signup-response.dto';
import { TokenUtils } from './utils/token.utils';
import { Request, Response } from 'express';
import { UseGuards } from '@nestjs/common';
import { VerifiedEmailGuard } from './guards/verified-email.guard';
import { AuthConfig } from 'src/config/auth.config';
import { TypedConfigService } from 'src/config/typed-config.service';

export interface GqlContext {
  req: Request;
  res: Response;
}

@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenUtils: TokenUtils,
    private configService: TypedConfigService,
  ) {}

  @Public()
  @Mutation(() => SignupResponse)
  async signup(
    @Args('signupInput') signupInput: SignupInput,
  ): Promise<SignupResponse> {
    return this.authService.signup(signupInput);
  }

  @Public()
  @Mutation(() => AuthResponse)
  async verifyEmail(
    @Args('token') token: string,
    @Context() context: GqlContext,
  ): Promise<AuthResponse> {
    const { token: authToken, user } =
      await this.authService.verifyEmail(token);

    // Set the token in an HTTP-only cookie only
    this.tokenUtils.setCookieToken(context.res, authToken);

    return { user };
  }

  @Public()
  @Mutation(() => AuthResponse)
  async login(
    @Args('loginInput') loginInput: LoginInput,
    @Context() { res }: GqlContext,
  ): Promise<AuthResponse> {
    const { token, user } = await this.authService.login(loginInput);

    // Set the token in an HTTP-only cookie only
    this.tokenUtils.setCookieToken(res, token);

    return { user };
  }

  @Mutation(() => AuthResponse)
  @UseGuards(VerifiedEmailGuard)
  async updatePassword(
    @CurrentUser() user: User,
    @Args('updatePasswordInput') updatePasswordInput: UpdatePasswordInput,
    @Context() context: GqlContext,
  ): Promise<AuthResponse> {
    const result = await this.authService.updatePassword(
      user.id,
      updatePasswordInput,
    );

    // Set the new token in an HTTP-only cookie only
    this.tokenUtils.setCookieToken(context.res, result.token);

    return { user: result.user };
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
    @Context() context: GqlContext,
  ): Promise<AuthResponse> {
    const result = await this.authService.resetPassword(resetPasswordInput);

    // Set the new token in an HTTP-only cookie only
    this.tokenUtils.setCookieToken(context.res, result.token);

    return { user: result.user };
  }

  @Mutation(() => Boolean)
  // eslint-disable-next-line @typescript-eslint/require-await
  async logout(@Context() context: GqlContext): Promise<boolean> {
    const authConfig = this.configService.get<AuthConfig>('auth');
    const isProduction = authConfig?.nodeEnv === 'production';

    // Clear the cookie with same options as when setting
    context.res.clearCookie('airbnbCloneJWT', {
      httpOnly: true,
      secure: isProduction,
      path: '/',
    });
    return true;
  }
}
