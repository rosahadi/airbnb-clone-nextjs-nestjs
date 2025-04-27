import {
  forgotPasswordSchema,
  passwordSchema,
  resetPasswordSchema,
  signInSchema,
  signupSchema,
} from "@/schema/auth";
import { z } from "zod";

export type SignupFormData = z.infer<typeof signupSchema>;
export type SignInFormData = z.infer<typeof signInSchema>;
export type ForgotPasswordFormData = z.infer<
  typeof forgotPasswordSchema
>;
export type PasswordFormData = z.infer<
  typeof passwordSchema
>;

export type ResetPasswordFormData = z.infer<
  typeof resetPasswordSchema
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

export interface ResetPasswordError extends AuthError {
  password?: string;
  passwordConfirm?: string;
  token?: string;
}

export interface PasswordError extends AuthError {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}
