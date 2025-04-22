export interface SignupFormData {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

export interface SignupError {
  name?: string;
  email?: string;
  password?: string;
  passwordConfirm?: string;
  general?: string;
}

export interface SignInFormData {
  email: string;
  password: string;
}

export interface SignInError {
  email?: string;
  password?: string;
  general?: string;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ForgotPasswordError {
  email?: string;
  general?: string;
}
