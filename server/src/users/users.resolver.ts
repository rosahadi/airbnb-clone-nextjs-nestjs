import { Resolver, Query, Mutation, Args, ID, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UpdateUserInput } from './dto/update-user.input';
import { UpdateMeInput } from './dto/update-profile.input';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from './role.enum';
import { VerifiedEmailGuard } from 'src/auth/guards/verified-email.guard';
import { TokenUtils } from 'src/auth/utils/token.utils';
import { JwtService } from '@nestjs/jwt';
import { GqlContext } from 'src/auth/auth.resolver';

@Resolver(() => User)
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly tokenUtils: TokenUtils,
    private readonly jwtService: JwtService,
  ) {}

  // Admin: Get all users
  @Query(() => [User])
  @Roles(Role.ADMIN)
  async users(): Promise<User[]> {
    return this.usersService.findAll();
  }

  // Admin: Get user by ID
  @Query(() => User)
  @Roles(Role.ADMIN)
  async user(@Args('id', { type: () => ID }) id: string): Promise<User> {
    return this.usersService.findById(id);
  }

  // User: Get my profile
  @Query(() => User)
  @UseGuards(VerifiedEmailGuard)
  async me(@CurrentUser() user: User): Promise<User> {
    return this.usersService.findById(user.id);
  }

  // Admin: Update any user
  @Mutation(() => User)
  @Roles(Role.ADMIN)
  async updateUser(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
  ): Promise<User> {
    return this.usersService.update(id, updateUserInput);
  }

  // User: Update my name, email, profileImage
  @Mutation(() => User)
  @UseGuards(VerifiedEmailGuard)
  async updateMe(
    @CurrentUser() user: User,
    @Args('updateMeInput', { type: () => UpdateMeInput })
    updateMeInput: UpdateMeInput,
    @Context() context: GqlContext,
  ): Promise<User> {
    // Update the user profile
    const updatedUser = await this.usersService.updateProfile(
      user.id,
      updateMeInput,
    );

    // Generate a new token with updated user information
    const token = this.generateToken(updatedUser);

    // Set the new token in the HTTP-only cookie
    this.tokenUtils.setCookieToken(context.res, token);

    return updatedUser;
  }

  // Helper method to generate token
  private generateToken(user: User): string {
    const payload = { email: user.email, sub: user.id, roles: user.roles };
    return this.jwtService.sign(payload);
  }

  // Admin: Delete any user
  @Mutation(() => User)
  @Roles(Role.ADMIN)
  async deleteUser(@Args('id', { type: () => ID }) id: string): Promise<User> {
    return this.usersService.remove(id);
  }

  // User: Delete my own account
  @Mutation(() => User)
  @UseGuards(VerifiedEmailGuard)
  async deleteMe(@CurrentUser() user: User): Promise<User> {
    return this.usersService.remove(user.id);
  }
}
