import { Field, InputType, Int } from '@nestjs/graphql';
import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  IsDateString,
} from 'class-validator';

@InputType()
export class PropertySearchInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  country?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  checkIn?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  checkOut?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  guests?: number;
}
