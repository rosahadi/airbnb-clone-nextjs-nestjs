import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Users } from "lucide-react";
import { usePropertyBookingStore } from "@/stores/usePropertyBookingStore";
import {
  formatCurrency,
  calculateNights,
} from "@/utils/format";

function BookingForm() {
  const { range, price } = usePropertyBookingStore(
    (state) => state
  );
  const [checkIn, checkOut] = range ?? [];

  if (!checkIn || !checkOut) return null;

  const totalNights = calculateNights(checkIn, checkOut);
  const priceInCents = Math.round(price * 100);
  const subtotalInCents = totalNights * priceInCents;

  const cleaningFee = 10 * 100;
  const serviceFee = 30 * 100;
  const tax = Math.round(subtotalInCents * 0.1);

  const totalAmount =
    subtotalInCents + cleaningFee + serviceFee + tax;

  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      <CardContent className="p-6">
        {/* Booking Details */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <Calendar
                size={16}
                className="text-rose-500"
              />
              <span className="text-sm font-medium">
                Check-in
              </span>
            </div>
            <span className="text-sm text-gray-600">
              {checkIn.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <Calendar
                size={16}
                className="text-rose-500"
              />
              <span className="text-sm font-medium">
                Check-out
              </span>
            </div>
            <span className="text-sm text-gray-600">
              {checkOut.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <Users size={16} className="text-rose-500" />
              <span className="text-sm font-medium">
                Duration
              </span>
            </div>
            <span className="text-sm text-gray-600">
              {totalNights}{" "}
              {totalNights === 1 ? "night" : "nights"}
            </span>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="border-t pt-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span>
              {formatCurrency(priceInCents)} × {totalNights}{" "}
              nights
            </span>
            <span>{formatCurrency(subtotalInCents)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span>Cleaning fee</span>
            <span>{formatCurrency(cleaningFee)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span>Service fee</span>
            <span>{formatCurrency(serviceFee)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span>Tax</span>
            <span>{formatCurrency(tax)}</span>
          </div>

          <div className="border-t pt-3 flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>{formatCurrency(totalAmount)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default BookingForm;
