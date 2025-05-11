import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsString, IsUUID, Max, Min } from 'class-validator';

@InputType()
export class CreateReviewInput {
  @Field(() => Int)
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @Field()
  @IsString()
  comment: string;

  @Field(() => ID)
  @IsUUID()
  propertyId: string;
}
