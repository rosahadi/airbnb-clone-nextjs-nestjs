"use client";
import { useMutation } from "@apollo/client";
import { LOGOUT_MUTATION } from "@/graphql/auth/mutations";
import { useAuthStore } from "@/stores/authStore";
import { apolloClient } from "@/lib/apollo-client";
import { toast } from "sonner";

export const useLogout = () => {
  const { reset } = useAuthStore();
  const [logoutMutation] = useMutation(LOGOUT_MUTATION);

  const logout = async () => {
    try {
      await logoutMutation();

      // Reset the auth store state
      reset();

      // clear Apollo cache
      await apolloClient.clearStore();

      window.location.reload();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error("Unable to log out", {
        description:
          error?.message ??
          "Something went wrong while logging out. Please try again.",
      });
    }
  };

  return logout;
};
