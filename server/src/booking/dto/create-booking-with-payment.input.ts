import { InputType, Field, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID, IsDateString } from 'class-validator';

@InputType()
export class CreateBookingWithPaymentInput {
  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID()
  propertyId: string;

  @Field()
  @IsNotEmpty()
  @IsDateString()
  checkIn: string;

  @Field()
  @IsNotEmpty()
  @IsDateString()
  checkOut: string;
}
