import { Field, Int, ObjectType } from '@nestjs/graphql';

export interface ChartData {
  date: string;
  count: number;
}

@ObjectType()
export class ChartDataDto implements ChartData {
  @Field()
  date: string;

  @Field(() => Int)
  count: number;
}
