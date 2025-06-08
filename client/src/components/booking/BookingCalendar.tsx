"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  generateDisabledDates,
  generateDateRange,
  defaultSelected,
  generateBlockedPeriods,
} from "@/utils/calendar";
import { usePropertyBookingStore } from "@/stores/usePropertyBookingStore";

function BookingCalendar() {
  const currentDate = new Date();
  const bookings = usePropertyBookingStore(
    (state) => state.bookings
  );

  const [range, setRange] =
    useState<[Date | null, Date | null]>(defaultSelected);
  const [startDate, endDate] = range;

  const blockedPeriods = generateBlockedPeriods({
    bookings,
    today: currentDate,
  });

  const unavailableDates =
    generateDisabledDates(blockedPeriods);

  useEffect(() => {
    if (!startDate || !endDate) return;

    const selectedRange = generateDateRange([
      startDate,
      endDate,
    ]);
    const isBlocked = selectedRange.some(
      (date) => unavailableDates[date]
    );

    if (isBlocked) {
      setRange(defaultSelected);
      toast.error(
        "Some dates are booked. Please select again."
      );
    } else {
      usePropertyBookingStore.setState({
        range: [startDate, endDate],
      });
    }
  }, [range, unavailableDates]);

  return (
    <div className="w-full">
      <DatePicker
        selected={startDate}
        onChange={(update) => {
          setRange(update as [Date, Date]);
        }}
        startDate={startDate}
        endDate={endDate}
        selectsRange
        inline
        minDate={currentDate}
        excludeDates={Object.keys(unavailableDates).map(
          (d) => new Date(d)
        )}
        calendarClassName="bg-white rounded-md shadow p-4"
        dayClassName={(date) => {
          const iso = date.toISOString().split("T")[0];
          const isUnavailable = unavailableDates[iso];
          return [
            "w-8 h-8 rounded-full text-sm",
            isUnavailable
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "",
            startDate?.toDateString() ===
            date.toDateString()
              ? "bg-primary text-white"
              : "",
            endDate?.toDateString() === date.toDateString()
              ? "bg-primary text-white"
              : "",
          ].join(" ");
        }}
      />
    </div>
  );
}

export default BookingCalendar;
