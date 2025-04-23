"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useMutation } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { RESET_PASSWORD_MUTATION } from "@/graphql/auth/mutations";
import { toast } from "sonner";
import Container from "@/components/Container";
import { Eye, EyeOff } from "lucide-react";
import Loader from "@/components/Loader";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ResetPasswordFormData } from "@/types/auth";
import { resetPasswordSchema } from "@/schema/auth";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState<string>("");
  const [isCheckingToken, setIsCheckingToken] =
    useState<boolean>(true);
  const [showPassword, setShowPassword] =
    useState<boolean>(false);
  const [showPasswordConfirm, setShowPasswordConfirm] =
    useState<boolean>(false);

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      passwordConfirm: "",
    },
  });

  const [resetPassword, { loading }] = useMutation(
    RESET_PASSWORD_MUTATION,
    {
      onCompleted: () => {
        toast.success("Password reset successfully!", {
          description:
            "You can now login with your new password.",
        });
        router.push("/");
      },
      onError: (error) => {
        form.clearErrors();

        if (error.graphQLErrors?.length) {
          const gqlError = error.graphQLErrors[0];

          if (
            gqlError.message.includes("token") ||
            gqlError.message.includes("invalid") ||
            gqlError.message.includes("expired")
          ) {
            form.setError("root", {
              type: "manual",
              message: "Invalid or expired reset token",
            });
            setToken("");
          } else if (
            gqlError.message.includes("Password")
          ) {
            form.setError("password", {
              type: "manual",
              message: gqlError.message,
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
            message: "Network error. Please try again.",
          });
        } else {
          form.setError("root", {
            type: "manual",
            message: "An unexpected error occurred",
          });
        }
      },
    }
  );

  useEffect(() => {
    const checkToken = async () => {
      setIsCheckingToken(true);
      const tokenFromUrl = searchParams.get("token");

      try {
        if (tokenFromUrl) {
          setToken(tokenFromUrl);
        } else {
          form.setError("root", {
            type: "manual",
            message: "Reset token is missing",
          });
        }
      } catch {
        form.setError("root", {
          type: "manual",
          message: "The reset token is invalid or expired",
        });
      } finally {
        setIsCheckingToken(false);
      }
    };

    checkToken();
  }, [searchParams, form]);

  const onSubmit = (data: ResetPasswordFormData) => {
    if (!token) {
      form.setError("root", {
        type: "manual",
        message: "Invalid reset token",
      });
      return;
    }

    resetPassword({
      variables: {
        resetPasswordInput: {
          token,
          password: data.password,
          passwordConfirm: data.passwordConfirm,
        },
      },
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const togglePasswordConfirmVisibility = () => {
    setShowPasswordConfirm(!showPasswordConfirm);
  };

  if (isCheckingToken) {
    return <Loader />;
  }

  return (
    <Container>
      <div className="flex flex-col items-center justify-center min-h-[70vh] py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">
              Reset Your Password
            </h1>
            <p className="text-gray-500 mt-2">
              Please enter your new password below
            </p>
          </div>

          {!token ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">
                Invalid Reset Link
              </h2>
              <p className="text-gray-500 mb-6">
                {form.formState.errors.root?.message ||
                  "The password reset link appears to be invalid or expired."}
              </p>
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Root/Server Error Message */}
                {form.formState.errors.root && (
                  <div className="text-red-500 text-sm mt-2 text-center">
                    {form.formState.errors.root.message}
                  </div>
                )}

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="relative">
                          <FormControl>
                            <Input
                              {...field}
                              type={
                                showPassword
                                  ? "text"
                                  : "password"
                              }
                              placeholder="Enter your new password"
                              autoComplete="new-password"
                              className="w-full px-4 py-2 rounded-md border border-border focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                          </FormControl>
                          <button
                            type="button"
                            onClick={
                              togglePasswordVisibility
                            }
                            className="absolute inset-y-0 right-0 flex items-center pr-3"
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5 text-gray-400" />
                            ) : (
                              <Eye className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="passwordConfirm"
                    render={({ field }) => (
                      <FormItem>
                        <div className="relative">
                          <FormControl>
                            <Input
                              {...field}
                              type={
                                showPasswordConfirm
                                  ? "text"
                                  : "password"
                              }
                              placeholder="Confirm your new password"
                              autoComplete="new-password"
                              className="w-full px-4 py-2 rounded-md border border-border focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                          </FormControl>
                          <button
                            type="button"
                            onClick={
                              togglePasswordConfirmVisibility
                            }
                            className="absolute inset-y-0 right-0 flex items-center pr-3"
                          >
                            {showPasswordConfirm ? (
                              <EyeOff className="h-5 w-5 text-gray-400" />
                            ) : (
                              <Eye className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 px-4 bg-rose-500 text-white rounded-md hover:bg-rose-600 transition-colors flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Resetting Password...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </form>
            </Form>
          )}
        </div>
      </div>
    </Container>
  );
}
