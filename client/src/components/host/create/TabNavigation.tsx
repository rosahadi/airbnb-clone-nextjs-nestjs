import React, { useRef, useState, useEffect } from "react";

export type TabType =
  | "basics"
  | "details"
  | "amenities"
  | "photos"
  | "review";

interface TabNavigationProps {
  selectedTab: TabType;
  setSelectedTab: (tab: TabType) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  selectedTab,
  setSelectedTab,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] =
    useState(false);

  const checkForArrows = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;

      // Show left arrow if scrolled away from the start
      setShowLeftArrow(scrollLeft > 0);

      // Show right arrow if there's more content to scroll to
      setShowRightArrow(
        scrollLeft < scrollWidth - clientWidth - 1
      ); // -1 for rounding errors
    }
  };

  useEffect(() => {
    // Check arrows on mount and window resize
    checkForArrows();

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkForArrows);
      window.addEventListener("resize", checkForArrows);
    }

    return () => {
      if (container) {
        container.removeEventListener(
          "scroll",
          checkForArrows
        );
      }
      window.removeEventListener("resize", checkForArrows);
    };
  }, []);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -100,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 100,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative mb-8">
      {/* Left scroll button - only visible when scrolled */}
      {showLeftArrow && (
        <button
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white bg-opacity-80 shadow-md h-8 w-8 rounded-full flex items-center justify-center md:hidden"
          aria-label="Scroll tabs left"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      )}

      {/* Tabs with horizontal scroll */}
      <div
        ref={scrollContainerRef}
        className="flex border-b overflow-x-auto scrollbar-hide"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <button
          onClick={() => setSelectedTab("basics")}
          className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${
            selectedTab === "basics"
              ? "border-b-2 border-primary text-primary"
              : "text-gray-500"
          }`}
        >
          Basic Info
        </button>
        <button
          onClick={() => setSelectedTab("details")}
          className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${
            selectedTab === "details"
              ? "border-b-2 border-primary text-primary"
              : "text-gray-500"
          }`}
        >
          Property Details
        </button>
        <button
          onClick={() => setSelectedTab("amenities")}
          className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${
            selectedTab === "amenities"
              ? "border-b-2 border-primary text-primary"
              : "text-gray-500"
          }`}
        >
          Amenities
        </button>
        <button
          onClick={() => setSelectedTab("photos")}
          className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${
            selectedTab === "photos"
              ? "border-b-2 border-primary text-primary"
              : "text-gray-500"
          }`}
        >
          Photos
        </button>
        <button
          onClick={() => setSelectedTab("review")}
          className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${
            selectedTab === "review"
              ? "border-b-2 border-primary text-primary"
              : "text-gray-500"
          }`}
        >
          Review & Submit
        </button>
      </div>

      {/* Right scroll button - only visible when more content exists */}
      {showRightArrow && (
        <button
          onClick={scrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white bg-opacity-80 shadow-md h-8 w-8 rounded-full flex items-center justify-center md:hidden"
          aria-label="Scroll tabs right"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default TabNavigation;
