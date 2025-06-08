"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@/components/ui/form";
import { usePropertyBookingStore } from "@/stores/usePropertyBookingStore";
import {
  useCreateBookingWithPayment,
  useBooking,
} from "@/hooks/useBooking";
import { toast } from "sonner";
import {
  CreateBookingWithPaymentFormData,
  PaymentSessionDto,
} from "@/types/booking";
import { createBookingWithPaymentSchema } from "@/schema/booking";
import { formatDateForInput } from "@/utils/format";
import { useState } from "react";
import { StripePayment } from "@/components/booking/StripePayment";
import {
  AlertCircle,
  CreditCard,
  Clock,
  Calendar,
  Shield,
  CalendarX,
  ArrowRight,
  Home,
} from "lucide-react";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import Loader from "../Loader";

function ConfirmBooking() {
  const { isAuthenticated, isLoading } = useAuth();
  const { propertyId, range, clearBookingData } =
    usePropertyBookingStore((state) => state);
  const router = useRouter();
  const [paymentSession, setPaymentSession] =
    useState<PaymentSessionDto | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [bookingId, setBookingId] = useState<string>("");
  const [paymentSuccessful, setPaymentSuccessful] =
    useState(false);
  const [isPropertyBooked, setIsPropertyBooked] =
    useState(false);

  const [checkIn, checkOut] = range ?? [];

  const checkInString = checkIn
    ? formatDateForInput(checkIn)
    : "";
  const checkOutString = checkOut
    ? formatDateForInput(checkOut)
    : "";

  const form = useForm<CreateBookingWithPaymentFormData>({
    resolver: zodResolver(createBookingWithPaymentSchema),
    defaultValues: {
      propertyId: propertyId || "",
      checkIn: checkInString,
      checkOut: checkOutString,
    },
  });

  const [createBookingWithPayment, { loading }] =
    useCreateBookingWithPayment();

  const { data: bookingData, loading: bookingLoading } =
    useBooking(bookingId);

  const handlePaymentSuccess = () => {
    setPaymentSuccessful(true);
    toast.success("Booking confirmed successfully! 🎉");

    router.push("/trips");

    setTimeout(() => {
      clearBookingData?.();
    }, 100);
  };

  const handlePaymentError = (error: Error) => {
    toast.error(
      error.message || "Payment failed. Please try again."
    );

    setShowPayment(false);
    setPaymentSession(null);
  };

  const handleRedirectToTrips = () => {
    clearBookingData?.();
    router.push("/trips");
  };

  const handleGoHome = () => {
    clearBookingData?.();
    router.push("/");
  };

  const onSubmit = async (
    data: CreateBookingWithPaymentFormData
  ) => {
    try {
      const result = await createBookingWithPayment({
        variables: {
          createBookingWithPaymentInput: {
            propertyId: data.propertyId,
            checkIn: data.checkIn,
            checkOut: data.checkOut,
          },
        },
      });

      if (result.data?.createBookingWithPayment) {
        const paymentData =
          result.data.createBookingWithPayment;

        setIsPropertyBooked(false);
        setPaymentSession(paymentData);
        setBookingId(paymentData.bookingId);
        setShowPayment(true);

        toast.success(
          "Booking prepared! Complete your payment to confirm."
        );
      } else {
        throw new Error("No payment session data received");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      handleBookingError(error);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleBookingError = (error: any) => {
    if (error.graphQLErrors?.length) {
      const gqlError = error.graphQLErrors[0];
      const message = gqlError.message;

      if (
        message.includes(
          "Check-in date cannot be in the past"
        )
      ) {
        form.setError("checkIn", {
          type: "manual",
          message: "Check-in date cannot be in the past",
        });
      } else if (
        message.includes(
          "Check-out date must be after check-in date"
        )
      ) {
        form.setError("checkOut", {
          type: "manual",
          message:
            "Check-out date must be after check-in date",
        });
      } else if (message.includes("Property not found")) {
        form.setError("propertyId", {
          type: "manual",
          message: "Property not found",
        });
      } else if (
        message.includes("already booked") ||
        message.includes("not available") ||
        message.includes(
          "Property is not available for these dates"
        )
      ) {
        setIsPropertyBooked(true);
        toast.error(
          "This property is not available for the selected dates."
        );
      } else {
        form.setError("root", {
          type: "manual",
          message: message,
        });
      }
    } else if (error.networkError) {
      form.setError("root", {
        type: "manual",
        message:
          "Network error. Please check your connection and try again.",
      });
    } else {
      form.setError("root", {
        type: "manual",
        message:
          "Failed to create booking. Please try again.",
      });
    }
  };

  const validateBookingData = () => {
    if (!propertyId || !checkIn || !checkOut) {
      return "Missing booking information. Please select dates and try again.";
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayString = formatDateForInput(today);

    if (checkInString < todayString) {
      return "Check-in date cannot be in the past. Please select a future date.";
    }

    if (checkOutString <= checkInString) {
      return "Check-out date must be after check-in date. Please select valid dates.";
    }

    return null;
  };

  const formatDateDisplay = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      "en-US",
      {
        weekday: "short",
        month: "short",
        day: "numeric",
      }
    );
  };

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const diffTime = checkOut.getTime() - checkIn.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (isLoading) {
    return <Loader />;
  }

  // Authentication required
  if (!isAuthenticated) {
    return (
      <div className="mt-6">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Sign In Required
            </h3>
            <p className="text-blue-700 mb-6">
              Please sign in to complete your booking and
              secure your reservation
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const validationError = validateBookingData();
  if (validationError && !paymentSuccessful) {
    return (
      <div className="mt-6">
        <Alert className="bg-gradient-to-r from-red-50 to-rose-50 border-red-200">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <AlertDescription className="text-red-700 font-medium">
            {validationError}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isPropertyBooked) {
    return (
      <div className="mt-6">
        <Card className="border-red-200 bg-gradient-to-r from-red-50 to-rose-50">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <CalendarX className="h-8 w-8 text-red-500" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-red-900">
                  Property Not Available
                </h3>
                <p className="text-red-700">
                  This property is already booked for{" "}
                  <span className="font-medium">
                    {formatDateDisplay(checkInString)} to{" "}
                    {formatDateDisplay(checkOutString)}
                  </span>
                </p>
                <p className="text-sm text-red-600">
                  Please select different dates or explore
                  other properties.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  onClick={handleRedirectToTrips}
                  className="flex-1 bg-rose-500 hover:bg-rose-600 text-white"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  View My Bookings
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <Button
                  onClick={handleGoHome}
                  variant="outline"
                  className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Find Other Properties
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showPayment && paymentSession && bookingLoading) {
    return (
      <div className="mt-6">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Loading Payment Details
            </h3>
            <p className="text-blue-700">
              Please wait while we prepare your payment...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (
    showPayment &&
    paymentSession &&
    bookingData?.booking
  ) {
    return (
      <div className="mt-6">
        <StripePayment
          booking={bookingData.booking}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
        />
      </div>
    );
  }

  const nights = calculateNights();

  return (
    <div className="mt-6 space-y-6">
      {/* Compact Trip Summary */}
      <div className="bg-gray-50 rounded-lg p-4 border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>
                {checkIn &&
                  formatDateDisplay(checkInString)}{" "}
                →{" "}
                {checkOut &&
                  formatDateDisplay(checkOutString)}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              {nights} {nights === 1 ? "night" : "nights"}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-500">
              30 min to complete
            </span>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          {/* Hidden form fields for validation */}
          <FormField
            control={form.control}
            name="propertyId"
            render={({ field }) => (
              <FormItem className="hidden">
                <FormControl>
                  <input {...field} type="hidden" />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="checkIn"
            render={({ field }) => (
              <FormItem className="hidden">
                <FormControl>
                  <input
                    {...field}
                    type="hidden"
                    value={field.value || ""}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="checkOut"
            render={({ field }) => (
              <FormItem className="hidden">
                <FormControl>
                  <input
                    {...field}
                    type="hidden"
                    value={field.value || ""}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Error Messages */}
          {Object.entries(form.formState.errors).map(
            ([key, error]) =>
              error && (
                <Alert
                  key={key}
                  className="bg-gradient-to-r from-red-50 to-rose-50 border-red-200"
                >
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <AlertDescription className="text-red-700 text-sm font-medium">
                    {error.message}
                  </AlertDescription>
                </Alert>
              )
          )}

          {/* Enhanced Submit Button */}
          <Button
            type="submit"
            className="w-full h-14 primary text-white font-semibold text-lg rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                <span>Preparing your booking...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Continue to Payment</span>
              </div>
            )}
          </Button>

          {/* Security Notice */}
          <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
            <Shield className="h-4 w-4" />
            <span>
              Secure payment • No charges until confirmation
            </span>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default ConfirmBooking;
