"use client";
import { useHostReservationStats } from "@/hooks/useBooking";
import { formatCurrency } from "@/utils/format";
import StatsCard from "./StatsCard";
import { Building, Moon, DollarSign } from "lucide-react";
import ErrorMessage from "../host/ErrorMessage";

function Stats() {
  const { data, loading, error } =
    useHostReservationStats();

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-20 sm:h-24 flex items-center justify-between p-4">
              <div className="space-y-2 flex-1">
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
                <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
              </div>
              <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded-lg flex-shrink-0"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-4 sm:mb-6">
        <ErrorMessage
          message={
            error.message ||
            "Failed to load reservation statistics"
          }
        />
      </div>
    );
  }

  const stats = data?.hostReservationStats || {
    properties: 0,
    nights: 0,
    amount: 0,
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
      <StatsCard
        title="Properties"
        value={stats.properties}
        icon={
          <Building className="h-5 w-5 sm:h-6 sm:w-6" />
        }
        description="Active listings"
        color="blue"
      />
      <StatsCard
        title="Total Nights"
        value={stats.nights}
        icon={<Moon className="h-5 w-5 sm:h-6 sm:w-6" />}
        description="Nights booked"
        color="indigo"
      />
      <StatsCard
        title="Revenue"
        value={formatCurrency(stats.amount)}
        icon={
          <DollarSign className="h-5 w-5 sm:h-6 sm:w-6" />
        }
        description="Total earnings"
        color="green"
      />
    </div>
  );
}

export default Stats;
