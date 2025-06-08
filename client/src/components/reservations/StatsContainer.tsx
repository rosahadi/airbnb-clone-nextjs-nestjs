"use client";
import { useAppStats } from "@/hooks/useBooking";
import Container from "@/components/Container";
import StatsCard from "./StatsCard";
import { Users, Building, Calendar } from "lucide-react";
import ErrorMessage from "../host/ErrorMessage";

function StatsContainer() {
  const { data, loading, error } = useAppStats();

  if (loading) {
    return (
      <Container>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-20 sm:h-24"></div>
            </div>
          ))}
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <div className="mt-4 sm:mt-6">
          <ErrorMessage
            message={
              error.message ||
              "Failed to load app statistics"
            }
          />
        </div>
      </Container>
    );
  }

  const stats = data?.appStats || {
    usersCount: 0,
    propertiesCount: 0,
    bookingsCount: 0,
  };

  return (
    <Container>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6">
        <StatsCard
          title="Users"
          value={stats.usersCount}
          icon={<Users className="h-5 w-5 sm:h-6 sm:w-6" />}
          description="Registered users"
          color="blue"
        />
        <StatsCard
          title="Properties"
          value={stats.propertiesCount}
          icon={
            <Building className="h-5 w-5 sm:h-6 sm:w-6" />
          }
          description="Listed properties"
          color="green"
        />
        <StatsCard
          title="Bookings"
          value={stats.bookingsCount}
          icon={
            <Calendar className="h-5 w-5 sm:h-6 sm:w-6" />
          }
          description="Total bookings"
          color="indigo"
        />
      </div>
    </Container>
  );
}

export default StatsContainer;
