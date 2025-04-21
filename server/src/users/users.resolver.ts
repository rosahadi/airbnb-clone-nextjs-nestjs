import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UpdateUserInput } from './dto/update-user.input';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from './role.enum';
import { VerifiedEmailGuard } from 'src/auth/guards/verified-email.guard';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [User])
  @Roles(Role.ADMIN)
  async users(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Query(() => User)
  @Roles(Role.ADMIN)
  async user(@Args('id', { type: () => ID }) id: string): Promise<User> {
    return this.usersService.findById(id);
  }

  @Query(() => User)
  @UseGuards(VerifiedEmailGuard)
  async me(@CurrentUser() user: User): Promise<User> {
    return this.usersService.findById(user.id);
  }

  @Mutation(() => User)
  @Roles(Role.ADMIN)
  async updateUser(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
  ): Promise<User> {
    return this.usersService.update(id, updateUserInput);
  }

  @Mutation(() => User)
  async updateMe(
    @CurrentUser() user: User,
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
  ): Promise<User> {
    return this.usersService.update(user.id, updateUserInput);
  }

  @Mutation(() => User)
  @Roles(Role.ADMIN)
  async deleteUser(@Args('id', { type: () => ID }) id: string): Promise<User> {
    return this.usersService.remove(id);
  }

  @Mutation(() => User)
  @UseGuards(VerifiedEmailGuard)
  async deleteMe(@CurrentUser() user: User): Promise<User> {
    return this.usersService.remove(user.id);
  }
}
