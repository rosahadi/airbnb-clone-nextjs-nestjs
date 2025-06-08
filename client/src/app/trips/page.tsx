"use client";
import EmptyList from "@/components/home/EmptyList";
import { useMyBookings } from "@/hooks/useBooking";
import Loader from "@/components/Loader";
import Container from "@/components/Container";
import BookingCard from "@/components/booking/BookingCard";
import { BookingStatus } from "@/types/booking";
import { useState } from "react";
import {
  Calendar,
  CheckCircle,
  XCircle,
  Hourglass,
} from "lucide-react";

function TripsPage() {
  const { data, loading, error, refetch } = useMyBookings();
  const [activeTab, setActiveTab] = useState<
    "upcoming" | "past" | "cancelled"
  >("upcoming");

  const bookings = data?.myBookings || [];
  const now = new Date();

  const categorizedBookings = {
    upcoming: bookings.filter((booking) => {
      const isConfirmed =
        booking.status === BookingStatus.CONFIRMED;
      const checkOutDate = new Date(booking.checkOut);
      return isConfirmed && checkOutDate > now;
    }),

    past: bookings.filter((booking) => {
      const isCompleted =
        booking.status === BookingStatus.COMPLETED;
      const isConfirmed =
        booking.status === BookingStatus.CONFIRMED;
      const checkOutDate = new Date(booking.checkOut);
      return (
        isCompleted || (isConfirmed && checkOutDate <= now)
      );
    }),

    cancelled: bookings.filter((booking) => {
      return booking.status === BookingStatus.CANCELLED;
    }),

    pending: bookings.filter((booking) => {
      return (
        booking.status === BookingStatus.PENDING_PAYMENT
      );
    }),
  };

  const tabs = [
    {
      key: "upcoming" as const,
      label: "Upcoming",
      count: categorizedBookings.upcoming.length,
      icon: Calendar,
      color: "text-blue-600",
    },
    {
      key: "past" as const,
      label: "Past Trips",
      count: categorizedBookings.past.length,
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      key: "cancelled" as const,
      label: "Cancelled",
      count: categorizedBookings.cancelled.length,
      icon: XCircle,
      color: "text-red-600",
    },
  ];

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Container>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
            <div className="text-center">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Something went wrong
              </h2>
              <p className="text-gray-600 mb-6">
                {error.message}
              </p>
              <button
                onClick={() => refetch()}
                className="primary text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
              >
                Try Again
              </button>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <EmptyList
        heading="No trips yet"
        message="Time to dust off your bags and start planning your next adventure"
      />
    );
  }

  const currentBookings = categorizedBookings[activeTab];

  return (
    <div className="min-h-screen bg-gray-50">
      <Container>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              My Trips
            </h1>
            <p className="text-gray-600">
              Manage your bookings and explore your travel
              history
            </p>
          </div>

          {categorizedBookings.pending.length > 0 && (
            <div className="mb-8 bg-amber-50 border border-amber-200 rounded-xl p-6">
              <div className="flex items-center mb-3">
                <Hourglass className="w-5 h-5 text-amber-600 mr-2" />
                <h3 className="font-semibold text-amber-900">
                  Pending Payment (
                  {categorizedBookings.pending.length})
                </h3>
              </div>
              <p className="text-amber-800 text-sm mb-4">
                Complete your payment to confirm these
                bookings
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categorizedBookings.pending.map(
                  (booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={{
                        id: booking.id,
                        propertyId: booking.property.id,
                        name: booking.property.name,
                        country: booking.property.country,
                        image: booking.property.image,
                        orderTotal: booking.orderTotal,
                        totalNights: booking.totalNights,
                        checkIn: booking.checkIn,
                        checkOut: booking.checkOut,
                        status: booking.status,
                      }}
                      onDelete={() => refetch()}
                      variant="pending"
                    />
                  )
                )}
              </div>
            </div>
          )}

          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.key;

                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                        isActive
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 mr-2 ${
                          isActive
                            ? "text-blue-600"
                            : tab.color
                        }`}
                      />
                      {tab.label}
                      {tab.count > 0 && (
                        <span
                          className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            isActive
                              ? "bg-blue-500 text-white"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {currentBookings.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {activeTab === "upcoming" && (
                  <Calendar className="w-12 h-12 text-gray-400" />
                )}
                {activeTab === "past" && (
                  <CheckCircle className="w-12 h-12 text-gray-400" />
                )}
                {activeTab === "cancelled" && (
                  <XCircle className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No{" "}
                {activeTab === "upcoming"
                  ? "upcoming trips"
                  : activeTab === "past"
                  ? "past trips"
                  : "cancelled bookings"}
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {activeTab === "upcoming" &&
                  "You don't have any upcoming trips. Start planning your next adventure!"}
                {activeTab === "past" &&
                  "You haven't completed any trips yet. Your travel history will appear here."}
                {activeTab === "cancelled" &&
                  "You don't have any cancelled bookings."}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {currentBookings.map((booking) => {
                const {
                  id,
                  orderTotal,
                  totalNights,
                  checkIn,
                  checkOut,
                  status,
                } = booking;

                const {
                  id: propertyId,
                  name,
                  country,
                  image,
                } = booking.property;

                let variant:
                  | "upcoming"
                  | "past"
                  | "cancelled"
                  | "pending" = "upcoming";

                if (status === BookingStatus.CANCELLED) {
                  variant = "cancelled";
                } else if (
                  status === BookingStatus.PENDING_PAYMENT
                ) {
                  variant = "pending";
                } else if (
                  new Date(checkOut) <= new Date()
                ) {
                  variant = "past";
                } else {
                  variant = "upcoming";
                }

                return (
                  <BookingCard
                    key={id}
                    booking={{
                      id,
                      propertyId,
                      name,
                      country,
                      image,
                      orderTotal,
                      totalNights,
                      checkIn,
                      checkOut,
                      status,
                    }}
                    onDelete={() => refetch()}
                    variant={variant}
                  />
                );
              })}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}

export default TripsPage;
