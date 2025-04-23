"use client";
import { ReactNode } from "react";
import { useAuth } from "@/stores/authStore";
import { SignupModal } from "./modal/SignupModal";
import { SignInModal } from "./modal/SignInModal";
import { useLogout } from "@/hooks/useLogout";
import { useAuthModalStore } from "@/stores/authModalStore";
import { ForgotPasswordModal } from "./modal/ForgotPasswordModal";
import { useRouter } from "next/navigation";

interface AuthComponentProps {
  children: ReactNode;
}

export function SignedIn({ children }: AuthComponentProps) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  return isAuthenticated ? <>{children}</> : null;
}

export function SignedOut({
  children,
}: AuthComponentProps) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  return !isAuthenticated ? <>{children}</> : null;
}

interface AuthButtonProps {
  children: ReactNode;
  mode?: "modal" | "redirect";
}

export function SignInButton({
  children,
  mode = "modal",
}: AuthButtonProps) {
  const { openSignIn } = useAuthModalStore();

  if (mode === "modal") {
    return (
      <>
        <div
          onClick={openSignIn}
          className="cursor-pointer w-full"
        >
          {children}
        </div>
        <SignInModal />
        <SignupModal />
        <ForgotPasswordModal />
      </>
    );
  }
  return <>{children}</>;
}

export function SignUpButton({
  children,
  mode = "modal",
}: AuthButtonProps) {
  const { openSignUp } = useAuthModalStore();

  if (mode === "modal") {
    return (
      <>
        <div
          onClick={openSignUp}
          className="cursor-pointer w-full"
        >
          {children}
        </div>
        <SignupModal />
        <SignInModal />
      </>
    );
  }
  return <>{children}</>;
}

export function SignOutLink() {
  const logout = useLogout();
  const router = useRouter();

  return (
    <button
      className="w-full text-left cursor-pointer"
      onClick={() => {
        logout();
        router.push("/");
      }}
    >
      Log out
    </button>
  );
}
