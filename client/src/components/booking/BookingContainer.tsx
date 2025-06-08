"use client";

import { usePropertyBookingStore } from "@/stores/usePropertyBookingStore";
import ConfirmBooking from "./ConfirmBooking";
import BookingForm from "./BookingForm";

function BookingContainer() {
  const { range } = usePropertyBookingStore(
    (state) => state
  );

  const [startDate, endDate] = range ?? [];

  if (!startDate || !endDate) return null;
  if (startDate.getTime() === endDate.getTime())
    return null;

  return (
    <div className="w-full">
      <BookingForm />
      <ConfirmBooking />
    </div>
  );
}

export default BookingContainer;
