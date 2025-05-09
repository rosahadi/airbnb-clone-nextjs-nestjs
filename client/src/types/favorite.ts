import {
  favoriteIdSchema,
  favoriteSchema,
  favoriteStatusSchema,
} from "@/schema/favorite";
import { z } from "zod";

export interface Favorite {
  id: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  property: {
    id: string;
    name: string;
    tagline: string;
    category: string;
    image: string;
    price: number;
    country: string;
  };
}

export interface FavoriteStatusResponse {
  isFavorite: boolean;
  favoriteId?: string;
}

export type FavoriteData = z.infer<typeof favoriteSchema>;
export type FavoriteIdParams = z.infer<
  typeof favoriteIdSchema
>;
export type FavoriteStatusParams = z.infer<
  typeof favoriteStatusSchema
>;

export interface FavoriteError {
  general?: string;
  propertyId?: string;
}
