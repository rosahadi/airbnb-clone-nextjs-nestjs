"use client";
import { Input } from "../ui/input";
import {
  useSearchParams,
  useRouter,
} from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";

function NavSearch() {
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState(
    searchParams.get("search")?.toString() || ""
  );
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearch = useDebouncedCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams);
      if (value) {
        params.set("search", value);
      } else {
        params.delete("search");
      }
      replace(`/?${params.toString()}`);
    },
    500
  );

  useEffect(() => {
    if (!searchParams.get("search")) {
      setSearch("");
    }
  }, [searchParams]);

  // Close expanded search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(
          event.target as Node
        ) &&
        isExpanded
      ) {
        setIsExpanded(false);
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
  }, [isExpanded]);

  return (
    <div
      className="relative w-full"
      ref={searchContainerRef}
    >
      <div
        className={`flex items-center border border-gray-300 rounded-full overflow-hidden transition-all ${
          isExpanded ? "shadow-md" : "hover:shadow-md"
        }`}
        onClick={() => setIsExpanded(true)}
      >
        {/* Desktop search with filters */}
        <div className="hidden md:flex flex-1 h-12 items-center divide-x divide-gray-300">
          <button className="px-4 font-medium text-sm whitespace-nowrap">
            Anywhere
          </button>
          <button className="px-4 font-medium text-sm whitespace-nowrap">
            Any week
          </button>
          <button className="px-4 text-sm whitespace-nowrap">
            Add guests
          </button>
        </div>

        {/* Mobile compact search */}
        <div className="md:hidden flex flex-1 h-12 items-center pl-4">
          <Search className="h-4 w-4 text-gray-500 mr-2" />
          <span className="font-medium text-sm">
            Search
          </span>
        </div>

        {/* Search input and button */}
        <div className="flex items-center">
          <Input
            type="text"
            placeholder="Where are you going?"
            className="border-0 focus-visible:ring-0 w-full md:w-40 h-12 px-4"
            onChange={(e) => {
              setSearch(e.target.value);
              handleSearch(e.target.value);
            }}
            value={search}
          />
          <button className="bg-rose-500 text-white p-2 rounded-full h-8 w-8 flex items-center justify-center mx-3">
            <Search className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Expanded mobile search overlay */}
      {isExpanded && (
        <div className="absolute top-16 left-0 right-0 bg-white p-4 rounded-lg shadow-lg md:hidden border border-gray-200 z-10">
          <div className="space-y-4">
            <div className="pb-2 border-b border-gray-200">
              <h3 className="font-bold mb-2">Where</h3>
              <Input
                placeholder="Search destinations"
                className="w-full"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  handleSearch(e.target.value);
                }}
              />
            </div>
            <div className="pb-2 border-b border-gray-200">
              <h3 className="font-bold mb-2">When</h3>
              <div className="flex gap-2">
                <button className="border border-gray-300 rounded-md p-2 text-sm flex-1">
                  Check in
                </button>
                <button className="border border-gray-300 rounded-md p-2 text-sm flex-1">
                  Check out
                </button>
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-2">Who</h3>
              <button className="border border-gray-300 rounded-md p-2 text-sm w-full text-left">
                Add guests
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NavSearch;
