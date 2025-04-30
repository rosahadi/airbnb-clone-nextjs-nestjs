import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsString, IsUrl, Min } from 'class-validator';

@InputType()
export class CreatePropertyInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  tagline: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  category: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  country: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  description: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  price: number;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  guests: number;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  bedrooms: number;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  beds: number;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  baths: number;

  @Field()
  @IsString()
  @IsNotEmpty()
  amenities: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  image: string;
}
