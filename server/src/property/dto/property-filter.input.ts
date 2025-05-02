import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';

@InputType()
export class PropertyFilterInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  category?: string;
}
