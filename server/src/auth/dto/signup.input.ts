import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, MinLength, IsString } from 'class-validator';

@InputType()
export class SignupInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Field()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @Field()
  @IsNotEmpty()
  @MinLength(8)
  passwordConfirm: string;
}
