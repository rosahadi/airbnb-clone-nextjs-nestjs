"use client";
import { useQuery, useMutation } from "@apollo/client";
import {
  GET_USER_BOOKINGS_QUERY,
  GET_BOOKING_QUERY,
  CREATE_BOOKING_WITH_PAYMENT_MUTATION,
  CONFIRM_PAYMENT_MUTATION,
  CANCEL_BOOKING_MUTATION,
  GET_HOST_RESERVATIONS_QUERY,
  GET_HOST_RESERVATION_STATS_QUERY,
  GET_APP_STATS_QUERY,
  GET_CHARTS_DATA_QUERY,
} from "@/graphql/booking";
import {
  Booking,
  BookingWithProperty,
  PaymentSessionDto,
  ReservationStats,
  AppStats,
  ChartData,
  ConfirmPaymentFormData,
  CreateBookingWithPaymentFormData,
} from "@/types/booking";

// User Booking Hooks
export const useMyBookings = () => {
  return useQuery<{ myBookings: BookingWithProperty[] }>(
    GET_USER_BOOKINGS_QUERY,
    {
      fetchPolicy: "cache-and-network",
      errorPolicy: "all",
    }
  );
};

export const useBooking = (id: string) => {
  return useQuery<{ booking: Booking }, { id: string }>(
    GET_BOOKING_QUERY,
    {
      variables: { id },
      fetchPolicy: "cache-and-network",
      skip: !id || id === "",
      errorPolicy: "all",
    }
  );
};

// Booking Mutation Hooks
export const useCreateBookingWithPayment = () => {
  return useMutation<
    { createBookingWithPayment: PaymentSessionDto },
    {
      createBookingWithPaymentInput: CreateBookingWithPaymentFormData;
    }
  >(CREATE_BOOKING_WITH_PAYMENT_MUTATION, {
    errorPolicy: "all",
    refetchQueries: [{ query: GET_USER_BOOKINGS_QUERY }],
  });
};

export const useConfirmPayment = () => {
  return useMutation<
    { confirmPayment: Booking },
    { confirmPaymentInput: ConfirmPaymentFormData }
  >(CONFIRM_PAYMENT_MUTATION, {
    errorPolicy: "all",
    refetchQueries: [
      { query: GET_USER_BOOKINGS_QUERY },
      { query: GET_HOST_RESERVATIONS_QUERY },
    ],
  });
};

export const useCancelBooking = (
  onSuccess?: (data: { cancelBooking: Booking }) => void,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onError?: (error: any) => void
) => {
  return useMutation<
    { cancelBooking: Booking },
    { id: string }
  >(CANCEL_BOOKING_MUTATION, {
    onCompleted: onSuccess,
    onError: onError,
    refetchQueries: [
      { query: GET_USER_BOOKINGS_QUERY },
      { query: GET_HOST_RESERVATIONS_QUERY },
    ],
    errorPolicy: "all",
  });
};

// Host Reservation Hooks
export const useHostReservations = () => {
  return useQuery<{ hostReservations: Booking[] }>(
    GET_HOST_RESERVATIONS_QUERY,
    {
      fetchPolicy: "cache-and-network",
      errorPolicy: "all",
    }
  );
};

export const useHostReservationStats = () => {
  return useQuery<{
    hostReservationStats: ReservationStats;
  }>(GET_HOST_RESERVATION_STATS_QUERY, {
    fetchPolicy: "cache-and-network",
    errorPolicy: "all",
  });
};

// App Statistics Hooks
export const useAppStats = () => {
  return useQuery<{ appStats: AppStats }>(
    GET_APP_STATS_QUERY,
    {
      fetchPolicy: "cache-and-network",
      errorPolicy: "all",
    }
  );
};

export const useChartsData = () => {
  return useQuery<{ chartsData: ChartData[] }>(
    GET_CHARTS_DATA_QUERY,
    {
      fetchPolicy: "cache-and-network",
      errorPolicy: "all",
    }
  );
};
