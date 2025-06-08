"use client";

import { useHostReservations } from "@/hooks/useBooking";
import Link from "next/link";
import EmptyList from "@/components/home/EmptyList";
import CountryFlagAndName from "@/components/card/CountryFlagAndName";
import { formatDate, formatCurrency } from "@/utils/format";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Stats from "@/components/reservations/Stats";
import Container from "@/components/Container";
import { Booking } from "@/types/booking";
import {
  AlertCircle,
  Calendar,
  User,
  Mail,
  MapPin,
  DollarSign,
} from "lucide-react";
import ErrorMessage from "@/components/host/ErrorMessage";
import Loader from "@/components/Loader";

function HostReservationsPage() {
  const { data, loading, error } = useHostReservations();

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="mb-4 sm:mb-6">
        <ErrorMessage
          message={
            error.message ||
            "An unexpected error occurred while fetching your reservations."
          }
        />
      </div>
    );
  }

  const reservations: Booking[] =
    data?.hostReservations || [];

  console.log("Processed reservations:", reservations);
  console.log("Reservations count:", reservations.length);

  if (!data) {
    return (
      <Container>
        <Stats />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4 px-4">
            <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto" />
            <h3 className="text-xl font-semibold">
              No Data Available
            </h3>
            <p className="text-muted-foreground">
              Unable to fetch reservation data.
            </p>
          </div>
        </div>
      </Container>
    );
  }

  if (reservations.length === 0) {
    return (
      <Container>
        <Stats />
        <EmptyList />
      </Container>
    );
  }

  return (
    <div className="pb-10 pt-12">
      <Container>
        <Stats />
        <div className="mt-8 space-y-6">
          {/* Mobile Card View (visible on small screens) */}
          <div className="block lg:hidden space-y-4">
            {reservations.map((booking) => {
              const {
                id,
                orderTotal,
                totalNights,
                checkIn,
                checkOut,
                paymentStatus,
              } = booking;

              const property = booking.property || {};
              const {
                id: propertyId = "",
                name: propertyName = "Unknown Property",
                country = "Unknown",
              } = property;

              const user = booking.user || {};
              const {
                name: guestName = "Unknown Guest",
                email: guestEmail = "No email provided",
              } = user;

              const startDate = formatDate(
                new Date(checkIn)
              );
              const endDate = formatDate(
                new Date(checkOut)
              );

              return (
                <div
                  key={id}
                  className="bg-card rounded-lg p-4 shadow-sm border space-y-4"
                >
                  {/* Property and Location */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      {propertyId ? (
                        <Link
                          href={`/properties/${propertyId}`}
                          className="font-semibold text-primary hover:text-primary/80 underline decoration-primary/30 hover:decoration-primary/60 transition-all duration-200 text-lg"
                        >
                          {propertyName}
                        </Link>
                      ) : (
                        <span className="font-semibold text-muted-foreground text-lg">
                          {propertyName}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <CountryFlagAndName
                        countryCode={country}
                      />
                    </div>
                  </div>

                  {/* Guest Info */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex items-center gap-2 flex-1">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {guestName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground text-sm truncate">
                        {guestEmail}
                      </span>
                    </div>
                  </div>

                  {/* Dates and Duration */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex items-center gap-2 flex-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div className="text-sm">
                        <span className="text-muted-foreground">
                          Check-in:{" "}
                        </span>
                        <span className="font-medium">
                          {startDate}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div className="text-sm">
                        <span className="text-muted-foreground">
                          Check-out:{" "}
                        </span>
                        <span className="font-medium">
                          {endDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Amount, Duration, and Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2 border-t">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-bold text-primary text-lg">
                          {formatCurrency(orderTotal)}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {totalNights}{" "}
                        {totalNights === 1
                          ? "night"
                          : "nights"}
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold transition-colors w-fit ${
                        paymentStatus
                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                      }`}
                    >
                      {paymentStatus
                        ? "✓ Paid"
                        : "⏳ Pending"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View (hidden on small screens) */}
          <div className="hidden lg:block bg-card rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/70">
                    <TableHead className="font-semibold text-primary px-6 py-4">
                      Property
                    </TableHead>
                    <TableHead className="font-semibold text-primary px-4 py-4">
                      Location
                    </TableHead>
                    <TableHead className="font-semibold text-primary px-4 py-4">
                      Guest
                    </TableHead>
                    <TableHead className="font-semibold text-primary px-4 py-4">
                      Contact
                    </TableHead>
                    <TableHead className="font-semibold text-primary px-4 py-4 text-center">
                      Duration
                    </TableHead>
                    <TableHead className="font-semibold text-primary px-4 py-4 text-right">
                      Amount
                    </TableHead>
                    <TableHead className="font-semibold text-primary px-4 py-4">
                      Check-in
                    </TableHead>
                    <TableHead className="font-semibold text-primary px-4 py-4">
                      Check-out
                    </TableHead>
                    <TableHead className="font-semibold text-primary px-4 py-4 text-center">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reservations.map((booking) => {
                    const {
                      id,
                      orderTotal,
                      totalNights,
                      checkIn,
                      checkOut,
                      paymentStatus,
                    } = booking;

                    // Safe property access with fallbacks
                    const property = booking.property || {};
                    const {
                      id: propertyId = "",
                      name: propertyName = "Unknown Property",
                      country = "Unknown",
                    } = property;

                    // Safe user access with fallbacks
                    const user = booking.user || {};
                    const {
                      name: guestName = "Unknown Guest",
                      email:
                        guestEmail = "No email provided",
                    } = user;

                    const startDate = formatDate(
                      new Date(checkIn)
                    );
                    const endDate = formatDate(
                      new Date(checkOut)
                    );

                    return (
                      <TableRow
                        key={id}
                        className="hover:bg-muted/30 transition-colors duration-200 border-b"
                      >
                        <TableCell className="px-6 py-4">
                          {propertyId ? (
                            <Link
                              href={`/properties/${propertyId}`}
                              className="font-medium text-primary hover:text-primary/80 underline decoration-primary/30 hover:decoration-primary/60 transition-all duration-200"
                            >
                              {propertyName}
                            </Link>
                          ) : (
                            <span className="font-medium text-muted-foreground">
                              {propertyName}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          <CountryFlagAndName
                            countryCode={country}
                          />
                        </TableCell>
                        <TableCell className="px-4 py-4 font-medium">
                          {guestName}
                        </TableCell>
                        <TableCell className="px-4 py-4 text-muted-foreground text-sm">
                          {guestEmail}
                        </TableCell>
                        <TableCell className="px-4 py-4 text-center">
                          <div className="font-medium">
                            {totalNights}{" "}
                            {totalNights === 1
                              ? "night"
                              : "nights"}
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-4 text-right font-bold text-primary">
                          {formatCurrency(orderTotal)}
                        </TableCell>
                        <TableCell className="px-4 py-4 text-muted-foreground text-sm">
                          {startDate}
                        </TableCell>
                        <TableCell className="px-4 py-4 text-muted-foreground text-sm">
                          {endDate}
                        </TableCell>
                        <TableCell className="px-4 py-4 text-center">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                              paymentStatus
                                ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                            }`}
                          >
                            {paymentStatus
                              ? "✓ Paid"
                              : "⏳ Pending"}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default HostReservationsPage;
