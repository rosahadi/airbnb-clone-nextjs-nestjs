import { Field, InputType, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsDateString, IsUUID } from 'class-validator';

@InputType()
export class CreateBookingInput {
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
