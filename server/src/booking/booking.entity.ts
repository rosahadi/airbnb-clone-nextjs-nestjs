import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Property } from 'src/property/entities/property.entity';

@ObjectType()
@Entity()
export class Booking {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => Int)
  @Column('int')
  subTotal: number;

  @Field(() => Int)
  @Column('int')
  cleaning: number;

  @Field(() => Int)
  @Column('int')
  service: number;

  @Field(() => Int)
  @Column('int')
  tax: number;

  @Field(() => Int)
  @Column('int')
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

  // Store Stripe session ID for tracking and debugging
  @Field({ nullable: true })
  @Column({ nullable: true })
  stripeSessionId?: string;

  // Store payment intent ID for refunds and advanced operations
  @Field({ nullable: true })
  @Column({ nullable: true })
  stripePaymentIntentId?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  paymentCompletedAt?: Date;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.bookings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Field(() => Property)
  @ManyToOne(() => Property, (property) => property.bookings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'propertyId' })
  property: Property;

  @Column()
  propertyId: string;
}
