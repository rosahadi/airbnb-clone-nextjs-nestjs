import { z } from "zod";

export const BookingStatusEnum = z.enum([
  "pending_payment",
  "confirmed",
  "cancelled",
  "completed",
]);

export const createBookingWithPaymentSchema = z
  .object({
    propertyId: z
      .string()
      .uuid("Invalid property ID format"),
    checkIn: z.string().refine(
      (date) => {
        const checkInDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return checkInDate >= today;
      },
      {
        message: "Check-in date cannot be in the past",
      }
    ),
    checkOut: z.string(),
  })
  .refine(
    (data) => {
      const checkInDate = new Date(data.checkIn);
      const checkOutDate = new Date(data.checkOut);
      return checkOutDate > checkInDate;
    },
    {
      message: "Check-out date must be after check-in date",
      path: ["checkOut"],
    }
  );

export const updateBookingSchema = z.object({
  status: BookingStatusEnum.optional(),
  paymentStatus: z.boolean().optional(),
});

export const deleteBookingSchema = z.object({
  bookingId: z.string().uuid("Invalid booking ID format"),
});

export const bookingIdSchema = z.object({
  id: z.string().uuid("Invalid booking ID format"),
});

export const createPaymentSessionSchema = z.object({
  propertyId: z.string().uuid("Invalid property ID format"),
  checkIn: z.string(),
  checkOut: z.string(),
});

export const confirmPaymentSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
});

export const paymentSessionResponseSchema = z.object({
  clientSecret: z
    .string()
    .min(1, "Client secret is required"),
  sessionId: z.string().min(1, "Session ID is required"),
  bookingId: z.string().uuid("Invalid booking ID format"),
});

// Booking calculation schema
export const bookingCalculationSchema = z.object({
  totalNights: z
    .number()
    .positive("Total nights must be positive"),
  subTotal: z
    .number()
    .nonnegative("Subtotal cannot be negative"),
  cleaning: z
    .number()
    .nonnegative("Cleaning fee cannot be negative"),
  service: z
    .number()
    .nonnegative("Service fee cannot be negative"),
  tax: z.number().nonnegative("Tax cannot be negative"),
  orderTotal: z
    .number()
    .positive("Order total must be positive"),
});

export const reservationStatsSchema = z.object({
  properties: z.number().nonnegative(),
  nights: z.number().nonnegative(),
  amount: z.number().nonnegative(),
});

export const appStatsSchema = z.object({
  usersCount: z.number().nonnegative(),
  propertiesCount: z.number().nonnegative(),
  bookingsCount: z.number().nonnegative(),
});

export const chartDataSchema = z.object({
  date: z.string(),
  count: z.number().nonnegative(),
});

export const webhookEventSchema = z.object({
  type: z.string(),
  bookingId: z.string().optional(),
  sessionId: z.string().optional(),
  paymentIntentId: z.string().optional(),
  error: z.string().optional(),
  timestamp: z.date(),
});

export const bookingSchema = z.object({
  id: z.string().uuid(),
  subTotal: z.number().nonnegative(),
  cleaning: z.number().nonnegative(),
  service: z.number().nonnegative(),
  tax: z.number().nonnegative(),
  orderTotal: z.number().positive(),
  totalNights: z.number().positive(),
  checkIn: z.string(),
  checkOut: z.string(),
  status: BookingStatusEnum,
  paymentStatus: z.boolean(),
  stripeSessionId: z.string().optional(),
  stripePaymentIntentId: z.string().optional(),
  paymentCompletedAt: z.string().optional(),
  expiresAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  userId: z.string().uuid(),
  propertyId: z.string().uuid(),
});
