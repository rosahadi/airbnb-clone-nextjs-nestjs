import {
  forgotPasswordSchema,
  signInSchema,
  signupSchema,
} from "@/schema/auth";
import { z } from "zod";

export type SignupFormData = z.infer<typeof signupSchema>;
export type SignInFormData = z.infer<typeof signInSchema>;
export type ForgotPasswordFormData = z.infer<
  typeof forgotPasswordSchema
>;

export interface AuthError {
  general?: string;
}

export interface SignupError extends AuthError {
  name?: string;
  email?: string;
  password?: string;
  passwordConfirm?: string;
}

export interface SignInError extends AuthError {
  email?: string;
  password?: string;
}

export interface ForgotPasswordError extends AuthError {
  email?: string;
}
