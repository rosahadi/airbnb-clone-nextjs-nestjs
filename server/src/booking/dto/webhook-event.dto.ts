import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class WebhookEventDto {
  @Field()
  type: string;

  @Field({ nullable: true })
  bookingId?: string;

  @Field({ nullable: true })
  sessionId?: string;

  @Field({ nullable: true })
  paymentIntentId?: string;

  @Field({ nullable: true })
  error?: string;

  @Field()
  timestamp: Date;
}
