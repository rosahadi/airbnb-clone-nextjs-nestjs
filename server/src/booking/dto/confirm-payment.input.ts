import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class ConfirmPaymentInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  sessionId: string;
}
