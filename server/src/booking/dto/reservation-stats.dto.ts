import { Field, Int, ObjectType } from '@nestjs/graphql';

export interface ReservationStats {
  properties: number;
  nights: number;
  amount: number;
}

@ObjectType()
export class ReservationStatsDto implements ReservationStats {
  @Field(() => Int)
  properties: number;

  @Field(() => Int)
  nights: number;

  @Field(() => Int)
  amount: number;
}
