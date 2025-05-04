"use client";

import React from "react";
import { Star } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  PropertyFormData,
  PropertyError,
} from "@/types/property";
import AmenitiesInput from "@/components/input/AmenitiesInput";

interface AmenitiesTabProps {
  isVisible: boolean;
  form: UseFormReturn<PropertyFormData>;
  errors: PropertyError | null;
  handleAmenitiesChange: (
    selectedAmenities: string[]
  ) => void;
  navigateBack: () => void;
  navigateNext: () => void;
}

const AmenitiesTab: React.FC<AmenitiesTabProps> = ({
  isVisible,
  errors,
  handleAmenitiesChange,
  navigateBack,
  navigateNext,
}) => {
  if (!isVisible) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Star className="text-primary" size={24} />
        <h2 className="text-xl font-semibold">
          What amenities do you offer?
        </h2>
      </div>

      <p className="text-gray-600 mb-6">
        Select all amenities available to guests
      </p>

      <AmenitiesInput onChange={handleAmenitiesChange} />
      {errors?.amenities && (
        <p className="text-sm text-red-500 mt-1">
          {errors.amenities}
        </p>
      )}

      <div className="mt-8 flex justify-between">
        <Button
          type="button"
          onClick={navigateBack}
          variant="outline"
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Back
        </Button>
        <Button
          type="button"
          onClick={navigateNext}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
        >
          Next: Photos
        </Button>
      </div>
    </div>
  );
};

export default AmenitiesTab;
