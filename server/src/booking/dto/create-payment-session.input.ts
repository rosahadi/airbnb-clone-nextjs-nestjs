import { InputType, Field, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class CreatePaymentSessionInput {
  @Field(() => ID)
  @IsNotEmpty()
  @IsString()
  bookingId: string;
}
