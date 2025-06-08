import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class PaymentSessionDto {
  @Field()
  clientSecret: string;

  @Field()
  sessionId: string;

  @Field(() => ID)
  bookingId: string;
}
