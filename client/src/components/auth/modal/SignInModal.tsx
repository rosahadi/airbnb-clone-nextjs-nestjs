"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { LOGIN_MUTATION } from "@/graphql/auth/mutations";
import { useAuthStore } from "@/stores/authStore";
import { useAuthModalStore } from "@/stores/authModalStore";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signInSchema } from "@/schema/auth";
import { SignInFormData } from "@/types/auth";

export function SignInModal() {
  const { setUser, setIsAuthenticated } = useAuthStore();
  const {
    activeModal,
    closeModal,
    openSignUp,
    openForgotPassword,
  } = useAuthModalStore();
  const isOpen = activeModal === "signin";

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      form.reset();
    }
  }, [isOpen, form]);

  const [login, { loading }] = useMutation(LOGIN_MUTATION, {
    onCompleted: (data) => {
      if (data.login.token) {
        localStorage.setItem("token", data.login.token);
      }
      setUser(data.login.user);
      setIsAuthenticated(true);
      closeModal();
    },
    onError: (error) => {
      console.error("Login error:", error);

      // Clear any existing field errors
      form.clearErrors();

      if (error.graphQLErrors?.length) {
        const gqlError = error.graphQLErrors[0];

        if (
          gqlError.message.includes("Invalid credentials")
        ) {
          form.setError("root", {
            type: "manual",
            message: "Invalid email or password",
          });
        } else if (
          gqlError.message.includes("not verified")
        ) {
          form.setError("root", {
            type: "manual",
            message: "Please verify your email first",
          });
        } else {
          form.setError("root", {
            type: "manual",
            message: gqlError.message,
          });
        }
      } else if (error.networkError) {
        form.setError("root", {
          type: "manual",
          message: "Network error. Please try again",
        });
      } else {
        form.setError("root", {
          type: "manual",
          message: "An unexpected error occurred",
        });
      }
    },
  });

  const onSubmit = (data: SignInFormData) => {
    login({
      variables: {
        loginInput: data,
      },
    });
  };

  const handleSwitchToSignUp = () => {
    closeModal();
    setTimeout(openSignUp, 100);
  };

  const handleOpenForgotPassword = () => {
    closeModal();
    setTimeout(openForgotPassword, 100);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && closeModal()}
    >
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden rounded-2xl">
        <div className="relative border-b p-5">
          <DialogTitle className="text-center font-bold text-lg pt-2">
            Log in
          </DialogTitle>
        </div>

        <div className="p-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="Email"
                        className="h-12 border-gray-300 rounded-lg"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              {/* Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="Password"
                        className="h-12 border-gray-300 rounded-lg"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto text-sm text-gray-600"
                  onClick={handleOpenForgotPassword}
                >
                  Forgot password?
                </Button>
              </div>

              {/* Root/Server Error Message */}
              {form.formState.errors.root && (
                <div className="text-red-500 text-sm mt-2">
                  {form.formState.errors.root.message}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-semibold mt-4"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Continue"}
              </Button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    or
                  </span>
                </div>
              </div>

              {/* Switch to Sign Up */}
              <div className="text-center">
                <span className="text-gray-600">
                  Don&apos;t have an account?{" "}
                </span>
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto font-semibold text-gray-800"
                  onClick={handleSwitchToSignUp}
                >
                  Sign up
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
