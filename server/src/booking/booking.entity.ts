import { Field, ID, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/users/user.entity';
import { Property } from 'src/property/property.entity';

export enum BookingStatus {
  PENDING_PAYMENT = 'pending_payment',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

registerEnumType(BookingStatus, {
  name: 'BookingStatus',
});

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

  @Field(() => BookingStatus)
  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING_PAYMENT,
  })
  status: BookingStatus;

  @Field()
  @Column({ default: false })
  paymentStatus: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true })
  stripeSessionId?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  stripePaymentIntentId?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  paymentCompletedAt?: Date;

  // Expiration time for pending bookings
  @Field({ nullable: true })
  @Column({ nullable: true })
  expiresAt?: Date;

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
