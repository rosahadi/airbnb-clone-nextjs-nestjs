import {
  propertyFilterSchema,
  propertyIdSchema,
  propertySchema,
  propertySearchSchema,
  updatePropertySchema,
} from "@/schema/property";
import { z } from "zod";

export interface Property {
  id: string;
  name: string;
  tagline: string;
  category: string;
  image: string;
  country: string;
  description: string;
  price: number;
  guests: number;
  bedrooms: number;
  beds: number;
  baths: number;
  amenities: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  favorites?: Array<{
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  }>;
  reviews?: Array<{
    id: string;
    rating: number;
    comment: string;
  }>;
  bookings?: Array<{
    id: string;
    checkIn: string;
    checkOut: string;
  }>;
}

export type PropertyFormData = z.infer<
  typeof propertySchema
>;
export type PropertyFilterData = z.infer<
  typeof propertyFilterSchema
>;
export type UpdatePropertyFormData = z.infer<
  typeof updatePropertySchema
>;
export type PropertyIdParams = z.infer<
  typeof propertyIdSchema
>;

export type PropertySearchData = z.infer<
  typeof propertySearchSchema
>;

export type PropertyFormUnion =
  | PropertyFormData
  | UpdatePropertyFormData;

export interface PropertyError {
  general?: string;
  name?: string;
  tagline?: string;
  category?: string;
  country?: string;
  description?: string;
  price?: string;
  guests?: string;
  bedrooms?: string;
  beds?: string;
  baths?: string;
  amenities?: string;
  image?: string;
}

export interface PropertyFilterError {
  category?: string;
}

export interface PropertySearchError {
  general?: string;
  country?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: string;
}
