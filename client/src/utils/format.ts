export const formatDate = (
  date: Date,
  onlyMonth?: boolean
) => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
  };
  if (!onlyMonth) {
    options.day = "numeric";
  }

  return new Intl.DateTimeFormat("en-US", options).format(
    date
  );
};

export const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(
    2,
    "0"
  );
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatCurrency = (
  amountInCents: number
): string => {
  const dollars = amountInCents / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(dollars);
};

export const calculateNights = (
  checkIn: Date,
  checkOut: Date
): number => {
  const diffTime = Math.abs(
    checkOut.getTime() - checkIn.getTime()
  );
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export function formatQuantity(
  quantity: number,
  noun: string
): string {
  return quantity === 1
    ? `${quantity} ${noun}`
    : `${quantity} ${noun}s`;
}
