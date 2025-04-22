import { create } from "zustand";

type ModalType =
  | "signin"
  | "signup"
  | "forgotPassword"
  | null;

interface AuthModalState {
  activeModal: ModalType;
  openSignIn: () => void;
  openSignUp: () => void;
  openForgotPassword: () => void;
  closeModal: () => void;
}

export const useAuthModalStore = create<AuthModalState>(
  (set) => ({
    activeModal: null,
    openSignIn: () => set({ activeModal: "signin" }),
    openSignUp: () => set({ activeModal: "signup" }),
    openForgotPassword: () =>
      set({ activeModal: "forgotPassword" }),
    closeModal: () => set({ activeModal: null }),
  })
);
