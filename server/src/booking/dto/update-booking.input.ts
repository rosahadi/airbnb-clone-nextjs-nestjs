import { Field, InputType, PartialType } from '@nestjs/graphql';
import { IsOptional, IsBoolean } from 'class-validator';
import { CreateBookingInput } from './create-booking.input';

@InputType()
export class UpdateBookingInput extends PartialType(CreateBookingInput) {
  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  paymentStatus?: boolean;
}
