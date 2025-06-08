import { Booking } from "@/types/booking";
import { formatDateForInput } from "./format";

export const defaultSelected: [Date | null, Date | null] = [
  null,
  null,
];

export const generateBlockedPeriods = ({
  bookings,
  today,
}: {
  bookings: Booking[];
  today: Date;
}): [Date, Date][] => {
  const todayCopy = new Date(today);
  todayCopy.setHours(0, 0, 0, 0);

  const disabledDays: [Date, Date][] = [
    ...bookings.map((booking): [Date, Date] => {
      const checkInDate = new Date(booking.checkIn);
      const checkOutDate = new Date(booking.checkOut);
      const blockEndDate = new Date(checkOutDate);
      blockEndDate.setDate(blockEndDate.getDate() - 1);
      return [checkInDate, blockEndDate];
    }),
    [
      new Date(0),
      new Date(todayCopy.getTime() - 24 * 60 * 60 * 1000),
    ],
  ];

  return disabledDays;
};

export const generateDateRange = (
  range: [Date | null, Date | null]
): string[] => {
  const [from, to] = range;
  if (!from || !to) return [];

  const currentDate = new Date(from);
  const endDate = new Date(to);
  const dateRange: string[] = [];

  while (currentDate < endDate) {
    dateRange.push(formatDateForInput(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dateRange;
};

export const generateDisabledDates = (
  disabledRanges: [Date, Date][]
): { [key: string]: boolean } => {
  const disabledDates: { [key: string]: boolean } = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  disabledRanges.forEach(([from, to]) => {
    const currentDate = new Date(from);
    const endDate = new Date(to);

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
  return diffInMs / (1000 * 60 * 60 * 24);
}

export const isDateDisabled = (
  date: Date,
  disabledRanges: [Date, Date][]
): boolean => {
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  return disabledRanges.some(([from, to]) => {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    fromDate.setHours(0, 0, 0, 0);
    toDate.setHours(0, 0, 0, 0);

    return targetDate >= fromDate && targetDate <= toDate;
  });
};

export const getAvailableDateRanges = (
  startDate: Date,
  endDate: Date,
  bookings: Booking[]
): [Date, Date][] => {
  const availableRanges: [Date, Date][] = [];

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
      availableRanges.push([
        new Date(currentStart),
        new Date(
          booking.checkIn.getTime() - 24 * 60 * 60 * 1000
        ),
      ]);
    }
    currentStart = new Date(
      Math.max(
        currentStart.getTime(),
        booking.checkOut.getTime()
      )
    );
  }

  if (currentStart < endDate) {
    availableRanges.push([
      new Date(currentStart),
      new Date(endDate),
    ]);
  }

  return availableRanges;
};

export const formatDateRange = (
  range: [Date | null, Date | null]
): string => {
  const [from, to] = range;
  if (!from) return "";

  const fromStr = from.toLocaleDateString();
  const toStr = to ? to.toLocaleDateString() : "";

  return toStr ? `${fromStr} - ${toStr}` : fromStr;
};

export const validateDateRange = (
  range: [Date | null, Date | null]
): {
  isValid: boolean;
  error?: string;
} => {
  const [from, to] = range;

  if (!from) {
    return {
      isValid: false,
      error: "Check-in date is required",
    };
  }

  if (!to) {
    return {
      isValid: false,
      error: "Check-out date is required",
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (from < today) {
    return {
      isValid: false,
      error: "Check-in date cannot be in the past",
    };
  }

  if (to <= from) {
    return {
      isValid: false,
      error: "Check-out date must be after check-in date",
    };
  }

  return { isValid: true };
};
