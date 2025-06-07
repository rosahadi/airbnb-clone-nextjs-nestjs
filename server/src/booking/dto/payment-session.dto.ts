import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class PaymentSessionDto {
  @Field()
  clientSecret: string;

  @Field()
  sessionId: string;
}
