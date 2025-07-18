import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from 'src/users/user.entity';
import { Favorite } from 'src/favorite/favorite.entity';
import { Review } from 'src/review/review.entity';
import { Booking } from 'src/booking/booking.entity';

@ObjectType()
@Entity()
export class Property {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  tagline: string;

  @Field()
  @Column()
  category: string;

  @Field()
  @Column()
  image: string;

  @Field()
  @Column()
  country: string;

  @Field()
  @Column()
  description: string;

  @Field(() => Int)
  @Column()
  price: number;

  @Field(() => Int)
  @Column()
  guests: number;

  @Field(() => Int)
  @Column()
  bedrooms: number;

  @Field(() => Int)
  @Column()
  beds: number;

  @Field(() => Int)
  @Column()
  baths: number;

  @Field()
  @Column()
  amenities: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.properties, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: string;

  @Field(() => [Favorite], { nullable: true })
  @OneToMany(() => Favorite, (favorite) => favorite.property)
  favorites: Favorite[];

  @Field(() => [Review], { nullable: true })
  @OneToMany(() => Review, (review) => review.property)
  reviews: Review[];

  @Field(() => [Booking], { nullable: true })
  @OneToMany(() => Booking, (booking) => booking.property)
  bookings: Booking[];
}
