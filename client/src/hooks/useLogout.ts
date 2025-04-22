"use client";

import { useAuthStore } from "@/stores/authStore";

export const useLogout = () => {
  const { reset } = useAuthStore();

  const logout = () => {
    localStorage.removeItem("token");
    reset();
    window.location.reload();
  };

  return logout;
};
