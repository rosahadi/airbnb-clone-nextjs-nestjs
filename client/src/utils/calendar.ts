import { Booking } from "@/types/booking";
import { DateRange } from "react-day-picker";
import { formatDateForInput } from "./format";

export const defaultSelected: DateRange = {
  from: undefined,
  to: undefined,
};

export const generateBlockedPeriods = ({
  bookings,
  today,
}: {
  bookings: Booking[];
  today: Date;
}) => {
  const todayCopy = new Date(today);
  todayCopy.setHours(0, 0, 0, 0);

  const disabledDays: DateRange[] = [
    // Convert string dates to Date objects for bookings
    // Only block the nights being stayed (checkIn to checkOut - 1 day)
    ...bookings.map((booking) => {
      const checkInDate = new Date(booking.checkIn);
      const checkOutDate = new Date(booking.checkOut);

      // Block from check-in date to checkout date - 1 day
      // This allows checkout day to be available for new checkins
      const blockEndDate = new Date(checkOutDate);
      blockEndDate.setDate(blockEndDate.getDate() - 1);

      return {
        from: checkInDate,
        to: blockEndDate,
      };
    }),
    // Block all dates before today
    {
      from: new Date(0),
      to: new Date(
        todayCopy.getTime() - 24 * 60 * 60 * 1000
      ),
    },
  ];
  return disabledDays;
};

export const generateDateRange = (
  range: DateRange | undefined
): string[] => {
  if (!range || !range.from || !range.to) return [];

  const currentDate = new Date(range.from);
  const endDate = new Date(range.to);
  const dateRange: string[] = [];

  // Include check-in date but exclude check-out date
  while (currentDate < endDate) {
    const dateString = formatDateForInput(currentDate);
    dateRange.push(dateString);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dateRange;
};

export const generateDisabledDates = (
  disabledDays: DateRange[]
): { [key: string]: boolean } => {
  if (disabledDays.length === 0) return {};

  const disabledDates: { [key: string]: boolean } = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  disabledDays.forEach((range) => {
    if (!range.from || !range.to) return;

    const currentDate = new Date(range.from);
    const endDate = new Date(range.to);

    while (currentDate <= endDate) {
      if (currentDate < today) {
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }
      const dateString = formatDateForInput(currentDate);
      disabledDates[dateString] = true;
      currentDate.setDate(currentDate.getDate() + 1);
    }
  });

  return disabledDates;
};

export function calculateDaysBetween({
  checkIn,
  checkOut,
}: {
  checkIn: Date;
  checkOut: Date;
}) {
  const diffInMs = Math.abs(
    checkOut.getTime() - checkIn.getTime()
  );
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
  return diffInDays;
}

export const isDateDisabled = (
  date: Date,
  disabledRanges: DateRange[]
): boolean => {
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  return disabledRanges.some((range) => {
    if (!range.from || !range.to) return false;

    const fromDate = new Date(range.from);
    const toDate = new Date(range.to);
    fromDate.setHours(0, 0, 0, 0);
    toDate.setHours(0, 0, 0, 0);

    return targetDate >= fromDate && targetDate <= toDate;
  });
};

export const getAvailableDateRanges = (
  startDate: Date,
  endDate: Date,
  bookings: Booking[]
): DateRange[] => {
  const availableRanges: DateRange[] = [];

  const sortedBookings = bookings
    .map((booking) => ({
      checkIn: new Date(booking.checkIn),
      checkOut: new Date(booking.checkOut),
    }))
    .sort(
      (a, b) => a.checkIn.getTime() - b.checkIn.getTime()
    );

  let currentStart = new Date(startDate);

  for (const booking of sortedBookings) {
    if (currentStart < booking.checkIn) {
      availableRanges.push({
        from: new Date(currentStart),
        to: new Date(
          booking.checkIn.getTime() - 24 * 60 * 60 * 1000
        ),
      });
    }
    currentStart = new Date(
      Math.max(
        currentStart.getTime(),
        booking.checkOut.getTime()
      )
    );
  }

  if (currentStart < endDate) {
    availableRanges.push({
      from: new Date(currentStart),
      to: new Date(endDate),
    });
  }

  return availableRanges;
};

export const formatDateRange = (
  range: DateRange
): string => {
  if (!range.from) return "";

  const fromStr = range.from.toLocaleDateString();
  const toStr = range.to
    ? range.to.toLocaleDateString()
    : "";

  return toStr ? `${fromStr} - ${toStr}` : fromStr;
};

export const validateDateRange = (
  range: DateRange
): {
  isValid: boolean;
  error?: string;
} => {
  if (!range.from) {
    return {
      isValid: false,
      error: "Check-in date is required",
    };
  }

  if (!range.to) {
    return {
      isValid: false,
      error: "Check-out date is required",
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (range.from < today) {
    return {
      isValid: false,
      error: "Check-in date cannot be in the past",
    };
  }

  if (range.to <= range.from) {
    return {
      isValid: false,
      error: "Check-out date must be after check-in date",
    };
  }

  return { isValid: true };
};
