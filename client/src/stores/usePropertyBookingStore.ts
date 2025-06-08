import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Booking } from "@/types/booking";

interface PendingBooking {
  bookingId: string;
  propertyId: string;
  checkIn: string;
  checkOut: string;
  price?: number;
}

type PropertyState = {
  propertyId: string;
  price: number;
  bookings: Booking[];
  range: [Date | null, Date | null];
  pendingBookings: PendingBooking[];

  setPropertyId: (propertyId: string) => void;
  setPrice: (price: number) => void;
  setBookings: (bookings: Booking[]) => void;
  setRange: (range: [Date | null, Date | null]) => void;
  clearBookingData: () => void;

  // New methods for pending bookings
  addPendingBooking: (booking: PendingBooking) => void;
  removePendingBooking: (bookingId: string) => void;
  getPendingBooking: (
    bookingId: string
  ) => PendingBooking | undefined;
  restoreBookingData: (bookingId: string) => boolean;
};

export const usePropertyBookingStore =
  create<PropertyState>()(
    persist(
      (set, get) => ({
        propertyId: "",
        price: 0,
        bookings: [],
        range: [null, null],
        pendingBookings: [],

        setPropertyId: (propertyId: string) =>
          set({ propertyId }),
        setPrice: (price: number) => set({ price }),
        setBookings: (bookings: Booking[]) =>
          set({ bookings }),
        setRange: (range: [Date | null, Date | null]) =>
          set({ range }),

        clearBookingData: () =>
          set({
            propertyId: "",
            price: 0,
            bookings: [],
            range: [null, null],
          }),

        addPendingBooking: (booking: PendingBooking) =>
          set((state) => ({
            pendingBookings: [
              ...state.pendingBookings.filter(
                (b) => b.bookingId !== booking.bookingId
              ),
              booking,
            ],
          })),

        removePendingBooking: (bookingId: string) =>
          set((state) => ({
            pendingBookings: state.pendingBookings.filter(
              (b) => b.bookingId !== bookingId
            ),
          })),

        getPendingBooking: (bookingId: string) => {
          const state = get();
          return state.pendingBookings.find(
            (b) => b.bookingId === bookingId
          );
        },

        restoreBookingData: (bookingId: string) => {
          const state = get();
          const pendingBooking = state.pendingBookings.find(
            (b) => b.bookingId === bookingId
          );

          if (pendingBooking) {
            set({
              propertyId: pendingBooking.propertyId,
              range: [
                new Date(pendingBooking.checkIn),
                new Date(pendingBooking.checkOut),
              ],
              price: pendingBooking.price || 0,
            });
            return true;
          }
          return false;
        },
      }),
      {
        name: "property-booking-store",
        partialize: (state) => ({
          pendingBookings: state.pendingBookings,
        }),
      }
    )
  );
