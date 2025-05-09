import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class FavoriteStatusResponse {
  @Field(() => Boolean)
  isFavorite: boolean;

  @Field(() => String, { nullable: true })
  favoriteId?: string;
}
