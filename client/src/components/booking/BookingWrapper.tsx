"use client";

import { usePropertyBookingStore } from "@/stores/usePropertyBookingStore";
import BookingCalendar from "./BookingCalendar";
import BookingContainer from "./BookingContainer";
import { useEffect } from "react";
import { Booking } from "@/types/booking";

type BookingWrapperProps = {
  propertyId: string;
  price: number;
  bookings: Booking[];
};
export default function BookingWrapper({
  propertyId,
  price,
  bookings,
}: BookingWrapperProps) {
  useEffect(() => {
    usePropertyBookingStore.setState({
      propertyId,
      price,
      bookings,
    });
  }, [propertyId, bookings, price]);
  return (
    <>
      <BookingCalendar />
      <BookingContainer />
    </>
  );
}
