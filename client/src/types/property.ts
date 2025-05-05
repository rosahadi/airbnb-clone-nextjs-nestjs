import {
  propertyFilterSchema,
  propertyIdSchema,
  propertySchema,
  updatePropertySchema,
} from "@/schema/property";
import { z } from "zod";

export interface Property {
  id: string;
  name: string;
  price: number;
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
