import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsString, Max, Min } from 'class-validator';

@InputType()
export class UpdateReviewInput {
  @Field(() => Int, { nullable: true })
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @Field({ nullable: true })
  @IsString()
  comment?: string;
}
