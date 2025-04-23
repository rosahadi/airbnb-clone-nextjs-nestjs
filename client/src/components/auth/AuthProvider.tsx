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
  const { setUser, setIsAuthenticated, setIsLoading } =
    useAuthStore();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data, loading, error } = useQuery(
    GET_CURRENT_USER,
    {
      fetchPolicy: "network-only",
      errorPolicy: "all",
    }
  );

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
