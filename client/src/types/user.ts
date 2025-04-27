import { z } from "zod";

import { profileSchema } from "@/schema/user";

export type User = {
  id: string;
  name: string;
  email: string;
  roles: string[];
  profileImage: string;
  createdAt: string;
  updatedAt: string;
};

export type ProfileFormData = z.infer<typeof profileSchema>;

export interface ProfileError {
  name?: string;
  email?: string;
  profileImage?: string;
  general?: string;
}
