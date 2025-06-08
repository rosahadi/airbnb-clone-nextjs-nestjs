import CountryFlagAndName from "@/components/card/CountryFlagAndName";
import Link from "next/link";
import Image from "next/image";
import { formatDate, formatCurrency } from "@/utils/format";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  MapPin,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  Star,
} from "lucide-react";
import DeleteBookingForm from "@/components/booking/DeleteBookingForm";
import { BookingStatus } from "@/types/booking";
import { usePropertyBookingStore } from "@/stores/usePropertyBookingStore";
import { useRouter } from "next/navigation";

interface BookingCardProps {
  booking: {
    id: string;
    propertyId: string;
    name: string;
    country: string;
    image: string;
    orderTotal: number;
    totalNights: number;
    checkIn: string;
    checkOut: string;
    status?: BookingStatus;
  };
  onDelete: () => void;
  variant?: "upcoming" | "past" | "cancelled" | "pending";
}

function BookingCard({
  booking,
  onDelete,
  variant = "upcoming",
}: BookingCardProps) {
  const router = useRouter();
  const { setPropertyId, setRange } =
    usePropertyBookingStore();

  const checkInDate = formatDate(new Date(booking.checkIn));
  const checkOutDate = formatDate(
    new Date(booking.checkOut)
  );
  const now = new Date();
  const checkInDateTime = new Date(booking.checkIn);
  const checkOutDateTime = new Date(booking.checkOut);

  const isCurrentTrip =
    checkInDateTime <= now && checkOutDateTime > now;

  const handleCompletePayment = () => {
    setPropertyId(booking.propertyId);
    setRange([
      new Date(booking.checkIn),
      new Date(booking.checkOut),
    ]);

    router.push(`/properties/${booking.propertyId}`);
  };

  const statusConfig = {
    upcoming: {
      badge: {
        text: "Upcoming",
        color: "bg-blue-100 text-blue-800 border-blue-200",
      },
      icon: Calendar,
      iconColor: "text-blue-500",
      cardBorder: "border-blue-200",
      showCancel: true,
    },
    past: {
      badge: {
        text: "Completed",
        color:
          "bg-green-100 text-green-800 border-green-200",
      },
      icon: CheckCircle,
      iconColor: "text-green-500",
      cardBorder: "border-green-200",
      showCancel: false,
    },
    cancelled: {
      badge: {
        text: "Cancelled",
        color: "bg-red-100 text-red-800 border-red-200",
      },
      icon: XCircle,
      iconColor: "text-red-500",
      cardBorder: "border-red-200",
      showCancel: false,
    },
    pending: {
      badge: {
        text: "Payment Required",
        color:
          "bg-amber-100 text-amber-800 border-amber-200",
      },
      icon: CreditCard,
      iconColor: "text-amber-500",
      cardBorder: "border-amber-200",
      showCancel: true,
    },
  };

  const config = statusConfig[variant];
  const StatusIcon = config.icon;

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border-2 ${config.cardBorder} overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group`}
    >
      {/* Property Image */}
      <div className="relative h-48 sm:h-52 overflow-hidden">
        {booking.image ? (
          <Image
            src={booking.image}
            alt={booking.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            priority={false}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 flex items-center justify-center">
            <MapPin className="w-12 h-12 text-gray-500" />
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <div
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${config.badge.color} backdrop-blur-sm`}
          >
            <StatusIcon
              className={`w-3.5 h-3.5 mr-1.5 ${config.iconColor}`}
            />
            {config.badge.text}
          </div>
        </div>

        {/* Current Trip Indicator */}
        {isCurrentTrip && variant === "upcoming" && (
          <div className="absolute top-3 right-3">
            <div className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200 backdrop-blur-sm animate-pulse">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2 animate-pulse"></div>
              Active Trip
            </div>
          </div>
        )}

        {/* Delete Button */}
        {config.showCancel && (
          <div className="absolute top-3 right-3">
            <DeleteBookingForm
              bookingId={booking.id}
              onSuccess={onDelete}
            />
          </div>
        )}

        {/* Overlay for cancelled bookings */}
        {variant === "cancelled" && (
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="text-white text-center">
              <XCircle className="w-12 h-12 mx-auto mb-2 opacity-80" />
              <span className="text-sm font-medium">
                Booking Cancelled
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-6">
        {/* Property Name and Location */}
        <div className="mb-5">
          <h3 className="font-bold text-gray-900 text-xl mb-2 line-clamp-2 leading-tight">
            {booking.name}
          </h3>
          <div className="flex items-center text-gray-600">
            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
            <CountryFlagAndName
              countryCode={booking.country}
            />
          </div>
        </div>

        {/* Booking Details */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-gray-600">
              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
              <span className="text-sm">Check-in</span>
            </div>
            <span className="font-semibold text-gray-900 text-sm">
              {checkInDate}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center text-gray-600">
              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
              <span className="text-sm">Check-out</span>
            </div>
            <span className="font-semibold text-gray-900 text-sm">
              {checkOutDate}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center text-gray-600">
              <Clock className="w-4 h-4 mr-2 text-gray-400" />
              <span className="text-sm">Duration</span>
            </div>
            <span className="font-semibold text-gray-900 text-sm">
              {booking.totalNights}{" "}
              {booking.totalNights === 1
                ? "night"
                : "nights"}
            </span>
          </div>
        </div>

        {/* Price Section */}
        <div className="flex items-center justify-between mb-6 pt-4 border-t border-gray-100">
          <span className="text-gray-600 text-sm font-medium">
            {variant === "cancelled"
              ? "Refund amount"
              : "Total paid"}
          </span>
          <div className="text-right">
            <span
              className={`text-2xl font-bold ${
                variant === "cancelled"
                  ? "text-red-600"
                  : "text-gray-900"
              }`}
            >
              {formatCurrency(booking.orderTotal)}
            </span>
            {variant === "past" && (
              <div className="text-xs text-gray-500 mt-1">
                ≈ $
                {(
                  booking.orderTotal / booking.totalNights
                ).toFixed(0)}
                /night
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {variant === "pending" ? (
            <div className="space-y-2">
              <Button
                onClick={handleCompletePayment}
                className="w-full primary text-white font-semibold py-3 rounded-xl transition-all duration-300 hover:shadow-lg"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Complete Payment
              </Button>
              <Link
                href={`/properties/${booking.propertyId}`}
                className="block"
              >
                <Button
                  variant="outline"
                  className="w-full border-2 border-gray-200 hover:border-gray-300 font-medium py-3 rounded-xl transition-all duration-300"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Property
                </Button>
              </Link>
            </div>
          ) : variant === "past" ? (
            <div className="space-y-2">
              <Button className="w-full primary text-white font-semibold py-3 rounded-xl transition-all duration-300 hover:shadow-lg">
                <Star className="w-4 h-4 mr-2" />
                Write Review
              </Button>
              <Link
                href={`/properties/${booking.propertyId}`}
                className="block"
              >
                <Button
                  variant="outline"
                  className="w-full border-2 border-gray-200 hover:border-gray-300 font-medium py-3 rounded-xl transition-all duration-300"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Book Again
                </Button>
              </Link>
            </div>
          ) : (
            <Link
              href={`/properties/${booking.propertyId}`}
              className="block"
            >
              <Button className="w-full primary text-white font-semibold py-3 rounded-xl transition-all duration-300 hover:shadow-lg">
                <Eye className="w-4 h-4 mr-2" />
                View Property
              </Button>
            </Link>
          )}
        </div>

        {/* Additional Info for Current Trip */}
        {isCurrentTrip && variant === "upcoming" && (
          <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center text-purple-800 text-sm">
              <AlertCircle className="w-4 h-4 mr-2" />
              <span className="font-medium">
                Currently staying at this property
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BookingCard;
