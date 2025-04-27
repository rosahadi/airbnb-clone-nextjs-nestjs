"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@apollo/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import { UPDATE_PASSWORD_MUTATION } from "@/graphql/auth/mutations";
import { passwordSchema } from "@/schema/auth";
import {
  PasswordError,
  PasswordFormData,
} from "@/types/auth";

const PasswordForm: React.FC = () => {
  const [updatePassword, { loading }] = useMutation(
    UPDATE_PASSWORD_MUTATION
  );
  const [error, setError] = useState<PasswordError | null>(
    null
  );
  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);
  const [showNewPassword, setShowNewPassword] =
    useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const form = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: PasswordFormData) => {
    try {
      setError(null);

      const { data: responseData } = await updatePassword({
        variables: {
          updatePasswordInput: {
            currentPassword: data.currentPassword,
            password: data.newPassword,
            passwordConfirm: data.confirmPassword,
          },
        },
      });

      if (responseData?.updatePassword?.user) {
        toast.success("Password updated", {
          description:
            "Your password has been updated successfully.",
        });

        // Reset form after successful update
        form.reset();
      }
    } catch (err) {
      console.error("Password update error:", err);
      const error = err as Error;

      // Handle specific errors
      if (
        error.message.includes(
          "Current password is incorrect"
        )
      ) {
        setError({
          currentPassword: "Current password is incorrect",
        });
      } else {
        setError({
          general:
            error.message || "Failed to update password",
        });
      }
    }
  };

  return (
    <Form {...form}>
      {error?.general && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error.general}
          </AlertDescription>
        </Alert>
      )}

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={
                      showCurrentPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter your current password"
                    {...field}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() =>
                      setShowCurrentPassword(
                        !showCurrentPassword
                      )
                    }
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                </div>
              </FormControl>
              {error?.currentPassword && (
                <p className="text-sm text-red-500 mt-1">
                  {error.currentPassword}
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={
                      showNewPassword ? "text" : "password"
                    }
                    placeholder="Enter your new password"
                    {...field}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() =>
                      setShowNewPassword(!showNewPassword)
                    }
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm New Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Confirm your new password"
                    {...field}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-2">
          <Button
            type="submit"
            className="w-full md:w-auto bg-primary hover:bg-primary-hover"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PasswordForm;
