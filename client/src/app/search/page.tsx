"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { usePropertySearch } from "@/hooks/useProperty";
import Container from "@/components/Container";
import {
  Property,
  PropertySearchData,
} from "@/types/property";
import Loader from "@/components/Loader";

export default function SearchResults() {
  const searchParams = useSearchParams();
  const { searchProperties, properties, loading, error } =
    usePropertySearch();
  const [hasSearched, setHasSearched] = useState(false);

  const getSearchDataFromParams =
    (): PropertySearchData => {
      return {
        country: searchParams.get("country") || undefined,
        checkIn: searchParams.get("checkin") || undefined,
        checkOut: searchParams.get("checkout") || undefined,
        guests: searchParams.get("guests")
          ? parseInt(searchParams.get("guests")!)
          : undefined,
      };
    };

  useEffect(() => {
    const searchData = getSearchDataFromParams();

    if (
      searchData.country ||
      searchData.checkIn ||
      searchData.checkOut ||
      searchData.guests
    ) {
      searchProperties(searchData);
      setHasSearched(true);
    }
  }, [searchParams, searchProperties]);

  const searchData = getSearchDataFromParams();

  const getSearchSummary = () => {
    const parts = [];

    if (searchData.country) {
      parts.push(`in "${searchData.country}"`);
    }

    if (searchData.checkIn && searchData.checkOut) {
      const checkIn = new Date(
        searchData.checkIn
      ).toLocaleDateString();
      const checkOut = new Date(
        searchData.checkOut
      ).toLocaleDateString();
      parts.push(`from ${checkIn} to ${checkOut}`);
    }

    if (searchData.guests && searchData.guests > 1) {
      parts.push(`for ${searchData.guests} guests`);
    }

    return parts.length > 0
      ? parts.join(" ")
      : "all properties";
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <Container>
        <div className="py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-red-50 border-2 border-red-100 rounded-2xl p-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-red-800 mb-3">
                Something went wrong
              </h2>
              <p className="text-red-600 mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="primary text-white px-6 py-3 rounded-xl font-medium transition-all hover:shadow-lg"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </Container>
    );
  }

  if (!hasSearched) {
    return (
      <Container>
        <div className="py-20">
          <div className="text-center max-w-2xl mx-auto">
            <div className="mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Discover Amazing Properties
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Use the search bar above to find your
                perfect stay. Search by location, dates, or
                number of guests to get started.
              </p>
            </div>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="py-8">
        {/* Search Header */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Search Results
              </h1>
              <div className="flex items-center gap-2 text-gray-600">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="text-lg">
                  {properties && properties.length > 0
                    ? `${properties.length} ${
                        properties.length === 1
                          ? "property"
                          : "properties"
                      } found ${getSearchSummary()}`
                    : `No properties found ${getSearchSummary()}`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        {properties && properties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
              />
            ))}
          </div>
        ) : hasSearched ? (
          <div className="py-16">
            <div className="max-w-lg mx-auto text-center">
              <div className="bg-gray-50 rounded-3xl p-12 border border-gray-100">
                <div className="w-20 h-20 bg-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-10 h-10 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  No properties found
                </h3>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  We couldn&apos;t find any properties
                  matching your search criteria. Try
                  adjusting your filters or explore all
                  available properties.
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() =>
                      (window.location.href = "/")
                    }
                    className="primary text-white px-8 py-3 rounded-xl font-semibold w-full transition-all hover:shadow-lg"
                  >
                    Browse All Properties
                  </button>
                  <button
                    onClick={() => window.history.back()}
                    className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
                  >
                    ← Modify Search
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </Container>
  );
}

// Enhanced Property Card Component
interface PropertyCardProps {
  property: Property;
}

function PropertyCard({ property }: PropertyCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 cursor-pointer">
      <div className="relative h-64 overflow-hidden">
        <Image
          src={
            imageError
              ? "/placeholder-property.jpg"
              : property.image
          }
          alt={property.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          onError={() => setImageError(true)}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {property.name}
          </h3>
          <div className="flex items-center gap-1 text-gray-600 mb-3">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="text-sm truncate">
              {property.country}
            </span>
          </div>
          <div className="flex items-center gap-1 text-gray-500 text-sm">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span>Up to {property.guests} guests</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-900">
              ${property.price}
            </span>
            <span className="text-gray-600 text-sm">
              / night
            </span>
          </div>
          <button
            onClick={() =>
              (window.location.href = `/properties/${property.id}`)
            }
            className="primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:shadow-lg transform hover:scale-105"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
