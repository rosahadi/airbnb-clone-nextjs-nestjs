import { Field, ID, InputType } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';

@InputType()
export class ReviewFilterInput {
  @Field(() => ID, { nullable: true })
  @IsUUID()
  propertyId?: string;

  @Field(() => ID, { nullable: true })
  @IsUUID()
  userId?: string;
}
