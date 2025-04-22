"use client";

import { useForm } from "react-hook-form";
import { useMutation } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { FORGOT_PASSWORD_MUTATION } from "@/graphql/auth/mutations";
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
import { forgotPasswordSchema } from "@/schema/auth";
import { ForgotPasswordFormData } from "@/types/auth";

export function ForgotPasswordModal() {
  const { activeModal, closeModal, openSignIn } =
    useAuthModalStore();
  const isOpen = activeModal === "forgotPassword";

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const [forgotPassword, { loading }] = useMutation(
    FORGOT_PASSWORD_MUTATION,
    {
      onCompleted: () => {
        toast.success("Password reset link sent", {
          description:
            "If an account exists with this email, you'll receive a reset link shortly.",
        });
        closeModal();
      },
      onError: (error) => {
        console.error("Forgot password error:", error);

        // Clear any existing errors
        form.clearErrors();

        if (error.graphQLErrors?.length) {
          form.setError("root", {
            type: "manual",
            message:
              "There was a problem processing your request. Please try again.",
          });
        } else if (error.networkError) {
          form.setError("root", {
            type: "manual",
            message:
              "Network error. Please check your connection and try again.",
          });
        } else {
          form.setError("root", {
            type: "manual",
            message: "An error occurred. Please try again.",
          });
        }
      },
    }
  );

  const onSubmit = (data: ForgotPasswordFormData) => {
    forgotPassword({
      variables: {
        forgotPasswordInput: data,
      },
    });
  };

  const handleBackToSignIn = () => {
    closeModal();
    setTimeout(openSignIn, 100);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && closeModal()}
    >
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden rounded-2xl">
        <div className="relative border-b p-5">
          <DialogTitle className="text-center font-bold text-lg pt-2">
            Reset Password
          </DialogTitle>
        </div>

        <div className="p-6">
          <p className="text-gray-600 mb-4">
            Enter your email address and we&apos;ll send you
            a link to reset your password.
          </p>

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
                {loading ? "Sending..." : "Send reset link"}
              </Button>

              {/* Back to Login Button */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 rounded-lg border-gray-300 text-gray-700 font-semibold"
                onClick={handleBackToSignIn}
              >
                Back to login
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
