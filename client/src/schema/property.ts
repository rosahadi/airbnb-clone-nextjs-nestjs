import { z } from "zod";

export const propertySchema = z.object({
  name: z.string().min(1, "Property name is required"),
  tagline: z.string().min(1, "Tagline is required"),
  category: z.string().min(1, "Category is required"),
  country: z.string().min(1, "Country is required"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters"),
  price: z.coerce
    .number()
    .min(1, "Price must be greater than 0"),
  guests: z.coerce
    .number()
    .int("Guest count must be a whole number")
    .min(1, "Guest count must be at least 1"),
  bedrooms: z.coerce
    .number()
    .int("Bedroom count must be a whole number")
    .min(1, "Bedroom count must be at least 1"),
  beds: z.coerce
    .number()
    .int("Bed count must be a whole number")
    .min(1, "Bed count must be at least 1"),
  baths: z.coerce
    .number()
    .int("Bath count must be a whole number")
    .min(1, "Bath count must be at least 1"),
  amenities: z
    .string()
    .min(1, "At least one amenity is required"),
  image: z.string().min(1, "Property image is required"),
});

export const propertyFilterSchema = z.object({
  category: z.string().optional(),
});

export const updatePropertySchema =
  propertySchema.partial();

export const propertyIdSchema = z.object({
  id: z.string().uuid("Invalid property ID format"),
});

export const propertySearchSchema = z
  .object({
    country: z.string().optional(),
    checkIn: z.string().datetime().optional(),
    checkOut: z.string().datetime().optional(),
    guests: z.coerce
      .number()
      .int("Guest count must be a whole number")
      .min(1, "Guest count must be at least 1")
      .optional(),
  })
  .refine(
    (data) => {
      // If both checkIn and checkOut are provided, checkIn should be before checkOut
      if (data.checkIn && data.checkOut) {
        return (
          new Date(data.checkIn) < new Date(data.checkOut)
        );
      }
      return true;
    },
    {
      message:
        "Check-in date must be before check-out date",
      path: ["checkOut"],
    }
  )
  .refine(
    (data) => {
      // If checkIn is provided, it should be today or in the future
      if (data.checkIn) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return new Date(data.checkIn) >= today;
      }
      return true;
    },
    {
      message: "Check-in date cannot be in the past",
      path: ["checkIn"],
    }
  );
