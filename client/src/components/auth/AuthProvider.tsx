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

  const { data, loading } = useQuery(GET_CURRENT_USER, {
    skip:
      typeof window === "undefined" ||
      !localStorage.getItem("token"),
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      setIsAuthenticated(!!token);
      setIsLoading(loading);

      if (data?.me) {
        setUser(data.me);
      } else if (!loading && token) {
        // If we have a token but no user data and we're not loading, clear the token
        if (!data?.me) {
          localStorage.removeItem("token");
          setIsAuthenticated(false);
        }
      }
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
