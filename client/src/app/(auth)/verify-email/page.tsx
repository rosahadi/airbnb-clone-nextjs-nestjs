"use client";

import { useEffect, useState } from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useMutation } from "@apollo/client";
import { VERIFY_EMAIL_MUTATION } from "@/graphql/auth/mutations";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";
import Container from "@/components/Container";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setUser, setIsAuthenticated } = useAuthStore();

  const [verificationStatus, setVerificationStatus] =
    useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] =
    useState<string>("");

  const [verifyEmail] = useMutation(VERIFY_EMAIL_MUTATION, {
    onCompleted: (data) => {
      setUser(data.verifyEmail.user);
      setIsAuthenticated(true);
      setVerificationStatus("success");

      setTimeout(() => {
        router.push("/");
      }, 2000);
    },
    onError: (error) => {
      setVerificationStatus("error");

      if (error.graphQLErrors?.length) {
        const message = error.graphQLErrors[0].message;
        setErrorMessage(message);

        toast.error("Verification failed", {
          description: message,
        });
      } else {
        setErrorMessage(
          "An error occurred during verification. Please try again."
        );

        toast.error("Verification failed", {
          description:
            "An error occurred during verification. Please try again.",
        });
      }
    },
  });

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      verifyEmail({
        variables: {
          token,
        },
      });
    } else {
      setVerificationStatus("error");
      setErrorMessage(
        "Verification token is missing. Please check your email link."
      );
    }
  }, [searchParams, verifyEmail]);

  return (
    <Container>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        {verificationStatus === "loading" && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
            <h1 className="text-2xl font-bold mt-4">
              Verifying your email...
            </h1>
            <p className="text-gray-500 mt-2">
              Please wait while we verify your account.
            </p>
          </>
        )}

        {verificationStatus === "success" && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold">
              Email Verified Successfully!
            </h1>
            <p className="text-gray-500 mt-2">
              Thank you for verifying your email.
              Redirecting you to homepage...
            </p>
          </>
        )}

        {verificationStatus === "error" && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold">
              Verification Failed
            </h1>
            <p className="text-gray-500 mt-2">
              {errorMessage}
            </p>
            <button
              className="mt-6 px-6 py-2 bg-rose-500 text-white rounded-md hover:bg-rose-600 transition-colors"
              onClick={() => router.push("/")}
            >
              Go to Homepage
            </button>
          </>
        )}
      </div>
    </Container>
  );
}
