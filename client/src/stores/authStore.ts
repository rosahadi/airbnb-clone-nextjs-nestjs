import { create } from "zustand";
import { persist } from "zustand/middleware";

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
  initializeAuth: () => void;
}

const initialState = {
  isAuthenticated: false,
  user: null,
  isLoading: true,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      setUser: (user) => set({ user }),
      setIsAuthenticated: (isAuthenticated) =>
        set({ isAuthenticated }),
      setIsLoading: (isLoading) => set({ isLoading }),
      reset: () => {
        set(initialState);
      },
      initializeAuth: () => {
        const state = get();

        if (state.user) {
          set({ isAuthenticated: true, isLoading: true });
        } else {
          set({ ...initialState, isLoading: false });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    }
  )
);

export const useAuth = () => {
  const { isAuthenticated, user, isLoading } =
    useAuthStore();
  return { isAuthenticated, user, isLoading };
};
