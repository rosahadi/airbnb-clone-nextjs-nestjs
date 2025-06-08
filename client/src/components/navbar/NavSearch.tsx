"use client";
import { Input } from "../ui/input";
import {
  useSearchParams,
  useRouter,
} from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  Search,
  X,
  Plus,
  Minus,
  ChevronDown,
} from "lucide-react";
import { usePropertySearch } from "@/hooks/useProperty";
import { PropertySearchData } from "@/types/property";
import { formattedCountries } from "@/utils/countries";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (data: PropertySearchData) => void;
  initialData?: PropertySearchData;
  loading?: boolean;
}

function CountryDropdown({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredCountries = formattedCountries.filter(
    (country) =>
      country.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const selectedCountry = formattedCountries.find(
    (country) => country.name === value
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );
    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full flex items-center justify-between border border-gray-300 rounded-lg p-3 text-left focus:ring-2 focus:ring-rose-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-400"
      >
        <div className="flex items-center gap-2">
          {selectedCountry && (
            <span className="text-lg">
              {selectedCountry.flag}
            </span>
          )}
          <span className="text-gray-700">
            {selectedCountry
              ? selectedCountry.name
              : "Select a country"}
          </span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-gray-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-hidden">
          <div className="p-2 border-b border-gray-200">
            <Input
              type="text"
              placeholder="Search countries..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              className="w-full"
              autoFocus
            />
          </div>
          <div className="max-h-40 overflow-y-auto">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => {
                    onChange(country.name);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  className="w-full flex items-center gap-2 p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <span className="text-lg">
                    {country.flag}
                  </span>
                  <span className="text-gray-700">
                    {country.name}
                  </span>
                </button>
              ))
            ) : (
              <div className="p-3 text-gray-500 text-center">
                No countries found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Search Modal Component
function SearchModal({
  isOpen,
  onClose,
  onSearch,
  initialData,
  loading,
}: SearchModalProps) {
  const [country, setCountry] = useState(
    initialData?.country || ""
  );
  const [checkIn, setCheckIn] = useState(
    initialData?.checkIn || ""
  );
  const [checkOut, setCheckOut] = useState(
    initialData?.checkOut || ""
  );
  const [guests, setGuests] = useState(
    initialData?.guests || 1
  );

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      setCountry(initialData.country || "");
      setCheckIn(initialData.checkIn || "");
      setCheckOut(initialData.checkOut || "");
      setGuests(initialData.guests || 1);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      country: country.trim() || undefined,
      checkIn: checkIn || undefined,
      checkOut: checkOut || undefined,
      guests: guests > 0 ? guests : 1,
    });
  };

  const incrementGuests = () =>
    setGuests((prev) => Math.min(prev + 1, 20));
  const decrementGuests = () =>
    setGuests((prev) => Math.max(prev - 1, 1));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">
            Search Properties
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-6"
        >
          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Where
            </label>
            <CountryDropdown
              value={country}
              onChange={setCountry}
              disabled={loading}
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check in
              </label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check out
              </label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) =>
                  setCheckOut(e.target.value)
                }
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                disabled={loading}
                min={checkIn || undefined}
              />
            </div>
          </div>

          {/* Guests */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Guests
            </label>
            <div className="flex items-center justify-between border border-gray-300 rounded-lg p-3">
              <span className="text-gray-700">Adults</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={decrementGuests}
                  disabled={guests <= 1 || loading}
                  className="p-1 rounded-full border border-gray-300 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center font-medium">
                  {guests}
                </span>
                <button
                  type="button"
                  onClick={incrementGuests}
                  disabled={guests >= 20 || loading}
                  className="p-1 rounded-full border border-gray-300 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-rose-500 text-white py-4 rounded-lg font-medium hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
          >
            {loading ? (
              <>
                <Search className="h-5 w-5 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="h-5 w-5" />
                Search
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

function NavSearch() {
  const searchParams = useSearchParams();
  const { push } = useRouter();

  // Search hook integration
  const {
    searchProperties,
    loading,
    error,
    searchErrors,
    clearSearch,
  } = usePropertySearch();

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handle full search from modal
  const handleFullSearch = async (
    searchData: PropertySearchData
  ) => {
    // Build URL params
    const params = new URLSearchParams();

    if (searchData.country) {
      params.set("q", searchData.country);
    }
    if (searchData.checkIn) {
      params.set("checkin", searchData.checkIn);
    }
    if (searchData.checkOut) {
      params.set("checkout", searchData.checkOut);
    }
    if (searchData.guests && searchData.guests > 1) {
      params.set("guests", searchData.guests.toString());
    }

    // Navigate to search results page
    const searchUrl = params.toString()
      ? `/search?${params.toString()}`
      : "/search";
    push(searchUrl);

    // Execute search
    const success = await searchProperties(searchData);
    if (success) {
      setIsModalOpen(false);
    }
  };

  // Get current search data from URL
  const getCurrentSearchData = (): PropertySearchData => {
    return {
      country:
        searchParams.get("q") ||
        searchParams.get("search") ||
        "",
      checkIn: searchParams.get("checkin") || "",
      checkOut: searchParams.get("checkout") || "",
      guests: parseInt(searchParams.get("guests") || "1"),
    };
  };

  // Clear search when URL changes and no search params
  useEffect(() => {
    const currentSearch =
      searchParams.get("q") ||
      searchParams.get("search") ||
      "";

    if (!currentSearch) {
      clearSearch();
    }
  }, [searchParams, clearSearch]);

  // Get display values for buttons
  const currentSearchData = getCurrentSearchData();
  const locationDisplay =
    currentSearchData.country || "Anywhere";
  const datesDisplay =
    currentSearchData.checkIn && currentSearchData.checkOut
      ? `${new Date(
          currentSearchData.checkIn
        ).toLocaleDateString()} - ${new Date(
          currentSearchData.checkOut
        ).toLocaleDateString()}`
      : "Any week";
  const guestsDisplay =
    (currentSearchData?.guests || 1) > 1
      ? `${currentSearchData.guests} guests`
      : "Add guests";

  return (
    <>
      <div className="relative w-full">
        {/* Desktop search with full container */}
        <div className="hidden lg:block">
          <div
            className={`flex items-center border border-gray-300 rounded-full overflow-hidden transition-all hover:shadow-md ${
              loading ? "opacity-75" : ""
            }`}
          >
            <div className="flex flex-1 h-12 items-center divide-x divide-gray-300">
              <button
                className="px-4 font-medium text-sm whitespace-nowrap hover:bg-gray-50 min-w-0 truncate"
                onClick={() => setIsModalOpen(true)}
              >
                {locationDisplay}
              </button>
              <button
                className="px-4 font-medium text-sm whitespace-nowrap hover:bg-gray-50 min-w-0 truncate"
                onClick={() => setIsModalOpen(true)}
              >
                {datesDisplay}
              </button>
              <button
                className="px-4 text-sm whitespace-nowrap hover:bg-gray-50 min-w-0 truncate"
                onClick={() => setIsModalOpen(true)}
              >
                {guestsDisplay}
              </button>
            </div>
            <button
              className="bg-rose-500 text-white p-2 rounded-full h-8 w-8 flex items-center justify-center mx-3 hover:bg-rose-600 disabled:opacity-50 flex-shrink-0"
              onClick={() => setIsModalOpen(true)}
              disabled={loading}
            >
              <Search
                className={`h-4 w-4 ${
                  loading ? "animate-spin" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {/* Mobile/Tablet - just the search button without container */}
        <div className="lg:hidden">
          <button
            className="bg-rose-500 text-white p-2 rounded-full h-8 w-8 flex items-center justify-center hover:bg-rose-600 disabled:opacity-50"
            onClick={() => setIsModalOpen(true)}
            disabled={loading}
          >
            <Search
              className={`h-4 w-4 ${
                loading ? "animate-spin" : ""
              }`}
            />
          </button>
        </div>

        {/* Error display */}
        {(error || searchErrors.general) && (
          <div className="absolute top-14 left-0 right-0 bg-red-50 border border-red-200 rounded-md p-2 text-red-600 text-sm z-20">
            {error || searchErrors.general}
          </div>
        )}
      </div>

      {/* Search Modal */}
      <SearchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSearch={handleFullSearch}
        initialData={getCurrentSearchData()}
        loading={loading}
      />
    </>
  );
}

export default NavSearch;
