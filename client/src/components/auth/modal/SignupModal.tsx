"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { SIGNUP_MUTATION } from "@/graphql/auth/mutations";
import { toast } from "sonner";
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
import { signupSchema } from "@/schema/auth";
import { SignupError, SignupFormData } from "@/types/auth";

export function SignupModal() {
  const [errors, setErrors] = useState<SignupError | null>(
    null
  );

  // Use the Zustand store for modal management
  const { activeModal, closeModal, openSignIn } =
    useAuthModalStore();
  const isOpen = activeModal === "signup";

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      passwordConfirm: "",
    },
  });

  // Reset form and errors when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setErrors(null);
      form.reset();
    }
  }, [isOpen, form]);

  const [signup, { loading }] = useMutation(
    SIGNUP_MUTATION,
    {
      onCompleted: () => {
        toast.success(
          "Please check your email for verification link",
          {
            description:
              "We've sent you a verification email.",
          }
        );
        closeModal();
      },
      onError: (error) => {
        console.error("Signup error:", error);

        if (error.graphQLErrors?.length) {
          const gqlError = error.graphQLErrors[0];

          // Parse the error message to determine the field
          if (
            gqlError.message.includes(
              "Email already in use"
            )
          ) {
            form.setError("email", {
              type: "manual",
              message: "Email already in use",
            });
          } else if (
            gqlError.message.includes(
              "Passwords do not match"
            )
          ) {
            form.setError("passwordConfirm", {
              type: "manual",
              message: "Passwords do not match",
            });
          } else {
            setErrors({ general: gqlError.message });
          }
        } else if (error.networkError) {
          setErrors({
            general:
              "Network error. Please check your connection and try again.",
          });
        } else {
          setErrors({
            general: "An error occurred. Please try again.",
          });
        }
      },
    }
  );

  const onSubmit = (data: SignupFormData) => {
    setErrors(null);
    signup({
      variables: {
        signupInput: data,
      },
    });
  };

  const handleSwitchToSignIn = () => {
    closeModal();
    setTimeout(() => {
      openSignIn();
    }, 100);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && closeModal()}
    >
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden rounded-2xl">
        <div className="relative border-b p-5">
          <DialogTitle className="text-center font-bold text-lg pt-2">
            Sign up
          </DialogTitle>
        </div>

        <div className="p-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              {/* Name Field */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Full name"
                        className="h-12 border-gray-300 rounded-lg"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

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

              {/* Confirm Password Field */}
              <FormField
                control={form.control}
                name="passwordConfirm"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="Confirm password"
                        className="h-12 border-gray-300 rounded-lg"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              {/* General error message */}
              {errors?.general && (
                <div className="text-red-500 text-sm mt-2">
                  {errors.general}
                </div>
              )}

              <div className="pt-2 text-xs text-gray-500">
                By signing up, you agree to our Terms of
                Service, Privacy Policy, and Cookie Policy.
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-semibold mt-4"
                disabled={loading}
              >
                {loading
                  ? "Creating account..."
                  : "Continue"}
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

              {/* Switch to Sign In */}
              <div className="text-center">
                <span className="text-gray-600">
                  Already have an account?{" "}
                </span>
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto font-semibold text-gray-800"
                  onClick={handleSwitchToSignIn}
                >
                  Log in
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
