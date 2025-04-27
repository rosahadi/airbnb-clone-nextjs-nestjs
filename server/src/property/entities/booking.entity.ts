import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Property } from './property.entity';

@ObjectType()
@Entity()
export class Booking {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => Int)
  @Column()
  orderTotal: number;

  @Field(() => Int)
  @Column()
  totalNights: number;

  @Field()
  @Column()
  checkIn: Date;

  @Field()
  @Column()
  checkOut: Date;

  @Field()
  @Column({ default: false })
  paymentStatus: boolean;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.bookings, { onDelete: 'CASCADE' })
  user: User;

  @Field(() => Property)
  @ManyToOne(() => Property, (property) => property.bookings, {
    onDelete: 'CASCADE',
  })
  property: Property;
}
