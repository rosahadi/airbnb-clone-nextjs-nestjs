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
  } = useAuthStore();

  const { data, loading } = useQuery(GET_CURRENT_USER, {
    fetchPolicy: "network-only",
    errorPolicy: "all",
    skip: !isAuthenticated,
  });

  useEffect(() => {
    setIsLoading(loading);

    // If we have user data, we're authenticated
    if (data?.me) {
      setUser(data.me);
      setIsAuthenticated(true);
    } else if (!loading) {
      // If we're not loading and don't have user data,
      // we're not authenticated
      setUser(null);
      setIsAuthenticated(false);
    }
  }, [
    data,
    loading,
    setUser,
    setIsAuthenticated,
    setIsLoading,
  ]);

  return <>{children}</>;
}
