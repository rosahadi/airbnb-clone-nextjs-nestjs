import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Role } from './role.enum';
import * as crypto from 'crypto';
import { Property } from 'src/property/property.entity';
import { Favorite } from 'src/favorite/favorite.entity';
import { Review } from 'src/review/review.entity';
import { Booking } from 'src/booking/booking.entity';

@ObjectType()
@Entity()
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Field(() => [String])
  @Column('text', { array: true, default: [Role.USER] })
  roles: Role[];

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  profileImage?: string;

  @Field()
  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true })
  emailVerificationExpires: Date;

  @Column({ nullable: true })
  passwordResetToken?: string;

  @Column({ nullable: true })
  passwordResetExpires?: Date;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => [Property], { nullable: true })
  @OneToMany(() => Property, (property) => property.user)
  properties: Property[];

  @Field(() => [Favorite], { nullable: true })
  @OneToMany(() => Favorite, (favorite) => favorite.user)
  favorites: Favorite[];

  @Field(() => [Review], { nullable: true })
  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];

  @Field(() => [Booking], { nullable: true })
  @OneToMany(() => Booking, (booking) => booking.user)
  bookings: Booking[];

  createPasswordResetToken() {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

    return resetToken;
  }
}
