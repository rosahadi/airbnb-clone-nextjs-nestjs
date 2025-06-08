import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PropertyService } from './property.service';
import { Property } from './entities/property.entity';
import { User } from '../users/entities/user.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { VerifiedEmailGuard } from '../auth/guards/verified-email.guard';
import { Public } from '../auth/decorators/public.decorator';
import { CreatePropertyInput } from './dto/create-property.input';
import { UpdatePropertyInput } from './dto/update-property.input';
import { PropertyFilterInput } from './dto/property-filter.input';
import { PropertySearchInput } from './dto/property-search.input';

@Resolver(() => Property)
export class PropertyResolver {
  constructor(private readonly propertyService: PropertyService) {}

  // ---- Public Queries ----
  @Public()
  @Query(() => [Property])
  async properties(
    @Args('filters', { nullable: true }) filters?: PropertyFilterInput,
  ): Promise<Property[]> {
    return this.propertyService.findAllProperties(filters);
  }

  @Public()
  @Query(() => [Property])
  async searchProperties(
    @Args('searchInput', { nullable: true }) searchInput?: PropertySearchInput,
  ): Promise<Property[]> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.propertyService.searchProperties(searchInput);
  }

  @Public()
  @Query(() => Property)
  async property(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Property> {
    return this.propertyService.findPropertyById(id);
  }

  // ---- Authenticated Queries ----
  @Query(() => [Property])
  @UseGuards(VerifiedEmailGuard)
  async myProperties(@CurrentUser() user: User): Promise<Property[]> {
    return this.propertyService.getUserProperties(user.id);
  }

  // ---- Mutations ----
  @Mutation(() => Property)
  @UseGuards(VerifiedEmailGuard)
  async createProperty(
    @CurrentUser() user: User,
    @Args('createPropertyInput') createPropertyInput: CreatePropertyInput,
  ): Promise<Property> {
    return this.propertyService.createProperty(user, createPropertyInput);
  }

  @Mutation(() => Property)
  @UseGuards(VerifiedEmailGuard)
  async updateProperty(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
    @Args('updatePropertyInput') updatePropertyInput: UpdatePropertyInput,
  ): Promise<Property> {
    return this.propertyService.updateProperty(
      user.id,
      id,
      updatePropertyInput,
    );
  }

  @Mutation(() => Property)
  @UseGuards(VerifiedEmailGuard)
  async deleteProperty(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Property> {
    return this.propertyService.deleteProperty(user.id, id);
  }
}
