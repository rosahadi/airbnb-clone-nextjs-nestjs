import { Field, Int, ObjectType } from '@nestjs/graphql';

export interface AppStats {
  usersCount: number;
  propertiesCount: number;
  bookingsCount: number;
}

@ObjectType()
export class AppStatsDto implements AppStats {
  @Field(() => Int)
  usersCount: number;

  @Field(() => Int)
  propertiesCount: number;

  @Field(() => Int)
  bookingsCount: number;
}
