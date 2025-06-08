import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class WebhookEventDto {
  @Field()
  type: string;

  @Field()
  timestamp: Date;

  @Field(() => ID, { nullable: true })
  bookingId?: string;

  @Field({ nullable: true })
  sessionId?: string;

  @Field({ nullable: true })
  paymentIntentId?: string;

  @Field({ nullable: true })
  error?: string;
}
