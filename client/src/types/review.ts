import {
  reviewFilterSchema,
  reviewIdSchema,
  reviewSchema,
  updateReviewSchema,
} from "@/schema/review";
import { z } from "zod";

export interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  property?: {
    id: string;
    name: string;
    image: string;
  };
}

export interface PropertyRating {
  rating: number;
  count: number;
}

export type ReviewFormData = z.infer<typeof reviewSchema>;
export type ReviewFilterData = z.infer<
  typeof reviewFilterSchema
>;
export type UpdateReviewFormData = z.infer<
  typeof updateReviewSchema
>;
export type ReviewIdParams = z.infer<typeof reviewIdSchema>;

export type ReviewFormUnion =
  | ReviewFormData
  | UpdateReviewFormData;

export interface ReviewError {
  general?: string;
  rating?: string;
  comment?: string;
  propertyId?: string;
}

export interface ReviewFilterError {
  propertyId?: string;
  userId?: string;
}
