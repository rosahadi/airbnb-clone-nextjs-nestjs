import { z } from "zod";

export const reviewSchema = z.object({
  propertyId: z.string().uuid("Invalid property ID format"),
  rating: z.coerce
    .number()
    .int("Rating must be a whole number")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot be greater than 5"),
  comment: z
    .string()
    .min(10, "Comment must be at least 10 characters")
    .max(500, "Comment cannot exceed 500 characters"),
});

export const reviewFilterSchema = z.object({
  propertyId: z
    .string()
    .uuid("Invalid property ID format")
    .optional(),
  userId: z
    .string()
    .uuid("Invalid user ID format")
    .optional(),
});

export const updateReviewSchema = z.object({
  rating: z.coerce
    .number()
    .int("Rating must be a whole number")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot be greater than 5")
    .optional(),
  comment: z
    .string()
    .min(10, "Comment must be at least 10 characters")
    .max(500, "Comment cannot exceed 500 characters")
    .optional(),
});

export const reviewIdSchema = z.object({
  id: z.string().uuid("Invalid review ID format"),
});
