"use client";

import React, {
  useState,
  useEffect,
  useCallback,
} from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import {
  useCreateBookingWithPayment,
  useConfirmPayment,
} from "@/hooks/useBooking";
import { Booking } from "@/types/booking";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import {
  Loader2,
  CreditCard,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Clock,
  PartyPopper,
} from "lucide-react";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface StripePaymentProps {
  booking: Booking;
  onPaymentSuccess: () => void;
  onPaymentError: (error: Error) => void;
  className?: string;
}

enum PaymentStep {
  READY = "ready",
  INITIALIZING = "initializing",
  CHECKOUT = "checkout",
  PROCESSING = "processing",
  SUCCESS = "success",
  ERROR = "error",
}

const PaymentSuccessMessage: React.FC<{
  booking: Booking;
  onNewBooking: () => void;
}> = ({ booking, onNewBooking }) => {
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  return (
    <div className="text-center space-y-6 py-8">
      <div className="space-y-4">
        <div className="relative">
          <PartyPopper className="h-20 w-20 text-green-500 mx-auto animate-bounce" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-green-700">
            Payment Successful!
          </h2>
          <p className="text-lg text-gray-600">
            Your booking has been confirmed
          </p>
          <p className="text-sm text-gray-500">
            You paid {formatCurrency(booking.orderTotal)}{" "}
            for your {booking.totalNights}-night stay
          </p>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-center space-x-2 text-green-700 mb-2">
          <CheckCircle className="h-5 w-5" />
          <span className="font-semibold">
            Booking Confirmed
          </span>
        </div>
        <p className="text-sm text-green-600">
          A confirmation email has been sent to your email
          address with all the details.
        </p>
      </div>

      <div className="space-y-3">
        <Button
          onClick={onNewBooking}
          className="w-full bg-rose-500 hover:bg-rose-600 text-white"
          size="lg"
        >
          Make Another Booking
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => (window.location.href = "/trips")}
        >
          View My Bookings
        </Button>
      </div>
    </div>
  );
};

const StripeCheckout: React.FC<{
  clientSecret: string;
  onComplete: () => void;
}> = ({ clientSecret, onComplete }) => {
  const [isReady, setIsReady] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    if (clientSecret && clientSecret.startsWith("cs")) {
      setIsReady(true);
    }
  }, [clientSecret]);

  const handleComplete = useCallback(() => {
    if (hasCompleted) {
      return;
    }
    setHasCompleted(true);
    onComplete();
  }, [onComplete, hasCompleted]);

  if (!isReady) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-rose-500" />
          <p className="text-sm text-gray-600">
            Preparing secure payment...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="stripe-checkout-wrapper">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{
          clientSecret,
          onComplete: handleComplete,
        }}
      >
        <div className="min-h-[500px]">
          <EmbeddedCheckout />
        </div>
      </EmbeddedCheckoutProvider>
    </div>
  );
};

export const StripePayment: React.FC<
  StripePaymentProps
> = ({
  booking,
  onPaymentSuccess,
  onPaymentError,
  className = "",
}) => {
  const [step, setStep] = useState<PaymentStep>(
    PaymentStep.READY
  );
  const [clientSecret, setClientSecret] =
    useState<string>("");
  const [error, setError] = useState<string>("");
  const [retryCount, setRetryCount] = useState(0);
  const [completedBooking, setCompletedBooking] =
    useState<Booking | null>(null);

  const [createBookingWithPayment] =
    useCreateBookingWithPayment();
  const [confirmPayment] = useConfirmPayment();

  const extractSessionId = (
    clientSecret: string
  ): string => {
    const parts = clientSecret.split("_secret_");
    if (parts.length > 0) {
      return parts[0];
    }

    const match = clientSecret.match(/^(cs_[a-zA-Z0-9]+)/);
    return match ? match[1] : clientSecret;
  };

  const initializePayment = async () => {
    if (!booking?.property?.id) {
      setError("Invalid booking information");
      setStep(PaymentStep.ERROR);
      return;
    }

    setStep(PaymentStep.INITIALIZING);
    setError("");

    try {
      const result = await createBookingWithPayment({
        variables: {
          createBookingWithPaymentInput: {
            propertyId: booking.property.id,
            checkIn: booking.checkIn,
            checkOut: booking.checkOut,
          },
        },
      });

      if (result.errors?.length) {
        throw new Error(result.errors[0].message);
      }

      const paymentSession =
        result.data?.createBookingWithPayment;

      if (!paymentSession?.clientSecret) {
        throw new Error("Failed to create payment session");
      }

      setClientSecret(paymentSession.clientSecret);
      setStep(PaymentStep.CHECKOUT);
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "Failed to initialize payment";
      setError(errorMsg);
      setStep(PaymentStep.ERROR);
      onPaymentError(new Error(errorMsg));
    }
  };

  const handlePaymentConfirmation =
    useCallback(async () => {
      setStep(PaymentStep.PROCESSING);

      try {
        const cleanSessionId =
          extractSessionId(clientSecret);

        if (
          !cleanSessionId ||
          !cleanSessionId.startsWith("cs_")
        ) {
          throw new Error(
            `Invalid session ID format: ${cleanSessionId}`
          );
        }

        if (cleanSessionId.length > 66) {
          throw new Error(
            `Session ID too long: ${cleanSessionId.length} characters`
          );
        }

        // Wait a bit for Stripe to process
        await new Promise((resolve) =>
          setTimeout(resolve, 3000)
        );

        const result = await confirmPayment({
          variables: {
            confirmPaymentInput: {
              sessionId: cleanSessionId,
            },
          },
        });

        if (result.errors?.length) {
          throw new Error(result.errors[0].message);
        }

        if (result.data?.confirmPayment) {
          const confirmedBooking =
            result.data.confirmPayment;

          setCompletedBooking(confirmedBooking);
          setStep(PaymentStep.SUCCESS);
          onPaymentSuccess();
        } else {
          throw new Error(
            "Payment confirmation failed - no booking data returned"
          );
        }
      } catch (err) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : "Payment confirmation failed";
        setStep(PaymentStep.ERROR);
        setError(errorMsg);
        onPaymentError(new Error(errorMsg));
      }
    }, [
      confirmPayment,
      onPaymentSuccess,
      onPaymentError,
      clientSecret,
    ]);

  const resetPayment = () => {
    setStep(PaymentStep.READY);
    setClientSecret("");
    setError("");
    setRetryCount(0);
    setCompletedBooking(null);
  };

  const retryPayment = async () => {
    if (retryCount < 3) {
      setRetryCount((prev) => prev + 1);
      await initializePayment();
    } else {
      setError(
        "Too many retry attempts. Please refresh the page and try again."
      );
    }
  };

  // Check if booking is already paid
  if (booking.paymentStatus) {
    return (
      <Card className={className}>
        <CardContent className="text-center py-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-700 mb-2">
            Already Paid
          </h2>
          <p className="text-gray-600 mb-6">
            This booking has already been paid for.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5 text-rose-500" />
            <CardTitle>
              {step === PaymentStep.SUCCESS
                ? "Payment Complete"
                : "Complete Payment"}
            </CardTitle>
          </div>
          {step === PaymentStep.CHECKOUT && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetPayment}
              className="text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          )}
        </div>
        {step !== PaymentStep.SUCCESS && (
          <CardDescription>
            Secure payment for your {booking.totalNights}
            -night stay
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {step === PaymentStep.SUCCESS &&
          completedBooking && (
            <PaymentSuccessMessage
              booking={completedBooking}
              onNewBooking={resetPayment}
            />
          )}

        {step === PaymentStep.INITIALIZING && (
          <Alert className="bg-blue-50 border-blue-200">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <AlertDescription className="text-blue-700">
              Setting up secure payment...
            </AlertDescription>
          </Alert>
        )}

        {step === PaymentStep.PROCESSING && (
          <Alert className="bg-yellow-50 border-yellow-200">
            <Clock className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-700">
              Processing your payment. Please wait...
            </AlertDescription>
          </Alert>
        )}

        {step === PaymentStep.ERROR && error && (
          <Alert className="bg-red-50 border-red-200">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {step === PaymentStep.READY && (
          <div className="text-center">
            <Button
              onClick={initializePayment}
              size="lg"
              className="bg-rose-500 hover:bg-rose-600 text-white px-8"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Pay{" "}
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(booking.orderTotal / 100)}
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              🔒 Your payment information is secure and
              encrypted
            </p>
          </div>
        )}

        {step === PaymentStep.CHECKOUT && clientSecret && (
          <StripeCheckout
            clientSecret={clientSecret}
            onComplete={handlePaymentConfirmation}
          />
        )}

        {step === PaymentStep.ERROR && (
          <div className="text-center space-y-2">
            <Button
              onClick={
                retryCount < 3 ? retryPayment : resetPayment
              }
              variant="outline"
              className="w-full"
            >
              {retryCount < 3
                ? `Retry (${3 - retryCount} attempts left)`
                : "Start Over"}
            </Button>
            {retryCount >= 3 && (
              <p className="text-xs text-gray-500">
                If the problem persists, please contact
                support.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StripePayment;
