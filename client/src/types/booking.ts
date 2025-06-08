import {
  updateBookingSchema,
  bookingIdSchema,
  deleteBookingSchema,
  createPaymentSessionSchema,
  confirmPaymentSchema,
  createBookingWithPaymentSchema,
} from "@/schema/booking";
import { z } from "zod";
import { User } from "./user";
import { Property } from "./property";

export enum BookingStatus {
  PENDING_PAYMENT = "pending_payment",
  CONFIRMED = "confirmed",
  CANCELLED = "cancelled",
  COMPLETED = "completed",
}

export interface Booking {
  id: string;
  subTotal: number;
  cleaning: number;
  service: number;
  tax: number;
  orderTotal: number;
  totalNights: number;
  checkIn: string;
  checkOut: string;
  status: BookingStatus;
  paymentStatus: boolean;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  paymentCompletedAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  propertyId: string;
  user: User;
  property: Property;
}

export interface BookingBasic {
  id: string;
  subTotal: number;
  cleaning: number;
  service: number;
  tax: number;
  orderTotal: number;
  totalNights: number;
  checkIn: string;
  checkOut: string;
  status: BookingStatus;
  paymentStatus: boolean;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  paymentCompletedAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  propertyId: string;
}

export interface BookingWithProperty extends BookingBasic {
  property: Property;
}

export type CreateBookingWithPaymentFormData = z.infer<
  typeof createBookingWithPaymentSchema
>;
export type UpdateBookingFormData = z.infer<
  typeof updateBookingSchema
>;
export type BookingIdParams = z.infer<
  typeof bookingIdSchema
>;
export type DeleteBookingFormData = z.infer<
  typeof deleteBookingSchema
>;

export type CreatePaymentSessionFormData = z.infer<
  typeof createPaymentSessionSchema
>;
export type ConfirmPaymentFormData = z.infer<
  typeof confirmPaymentSchema
>;

export interface PaymentSessionDto {
  clientSecret: string;
  sessionId: string;
  bookingId: string;
}

export interface CreateBookingError {
  general?: string;
  propertyId?: string;
  checkIn?: string;
  checkOut?: string;
}

export interface UpdateBookingError {
  general?: string;
  subTotal?: string;
  cleaning?: string;
  service?: string;
  tax?: string;
  orderTotal?: string;
  totalNights?: string;
  paymentStatus?: string;
  status?: string;
  checkIn?: string;
  checkOut?: string;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  paymentCompletedAt?: string;
}

export interface PaymentError {
  general?: string;
  bookingId?: string;
  sessionId?: string;
}

export enum PaymentStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
  REFUNDED = "refunded",
  CANCELLED = "cancelled",
}

export interface WebhookEventDto {
  type: string;
  bookingId?: string;
  sessionId?: string;
  paymentIntentId?: string;
  error?: string;
  timestamp: Date;
}

export interface ReservationStats {
  properties: number;
  nights: number;
  amount: number;
}

export interface AppStats {
  usersCount: number;
  propertiesCount: number;
  bookingsCount: number;
}

export interface ChartData {
  date: string;
  count: number;
}

export interface BookingCalculation {
  totalNights: number;
  subTotal: number;
  cleaning: number;
  service: number;
  tax: number;
  orderTotal: number;
}

export interface PaymentSessionResponse {
  clientSecret: string;
  sessionId: string;
  bookingId: string;
  success: boolean;
  message?: string;
}
