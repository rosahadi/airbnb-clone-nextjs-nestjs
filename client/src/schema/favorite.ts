import { z } from "zod";

export const favoriteSchema = z.object({
  propertyId: z.string().uuid("Invalid property ID format"),
});

export const favoriteIdSchema = z.object({
  id: z.string().uuid("Invalid favorite ID format"),
});

export const favoriteStatusSchema = z.object({
  propertyId: z.string().uuid("Invalid property ID format"),
});
