import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PropertyRatingDto {
  @Field(() => Float)
  rating: number;

  @Field(() => Int)
  count: number;
}
