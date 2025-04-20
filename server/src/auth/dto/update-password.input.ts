import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, MinLength } from 'class-validator';

@InputType()
export class UpdatePasswordInput {
  @Field()
  @IsNotEmpty()
  currentPassword: string;

  @Field()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @Field()
  @IsNotEmpty()
  @MinLength(8)
  passwordConfirm: string;
}
