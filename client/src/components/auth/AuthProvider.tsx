"use client";
import { ReactNode, useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useQuery } from "@apollo/client";
import { GET_CURRENT_USER } from "@/graphql/user/queries";

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const {
    setUser,
    setIsAuthenticated,
    setIsLoading,
    isAuthenticated,
    reset,
  } = useAuthStore();

  const { data, loading, error } = useQuery(
    GET_CURRENT_USER,
    {
      fetchPolicy: "network-only",
      errorPolicy: "all",
      skip: !isAuthenticated,
    }
  );

  useEffect(() => {
    setIsLoading(loading);

    // If we have user data, we're authenticated
    if (data?.me) {
      setUser(data.me);
      setIsAuthenticated(true);
      return;
    }

    if (!loading && isAuthenticated) {
      if (error || !data?.me) {
        reset();
      }
    }
  }, [
    data,
    loading,
    error,
    isAuthenticated,
    setUser,
    setIsAuthenticated,
    setIsLoading,
    reset,
  ]);

  return <>{children}</>;
}
