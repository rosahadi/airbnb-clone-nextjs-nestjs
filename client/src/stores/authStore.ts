import { create } from "zustand";

interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

interface AuthStore {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  reset: () => void;
}

const initialState = {
  isAuthenticated: false,
  user: null,
  isLoading: true,
};

export const useAuthStore = create<AuthStore>((set) => ({
  ...initialState,
  setUser: (user) => set({ user }),
  setIsAuthenticated: (isAuthenticated) =>
    set({ isAuthenticated }),
  setIsLoading: (isLoading) => set({ isLoading }),
  reset: () => set(initialState),
}));

export const useAuth = () => {
  const { isAuthenticated, user, isLoading } =
    useAuthStore();
  return { isAuthenticated, user, isLoading };
};
