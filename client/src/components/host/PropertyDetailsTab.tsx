/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { User } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  PropertyFormUnion,
  PropertyError,
} from "@/types/property";

interface PropertyDetailsTabProps<
  T extends PropertyFormUnion
> {
  isVisible: boolean;
  form: UseFormReturn<T>;
  errors: PropertyError | null;
  navigateBack: () => void;
  navigateNext: () => void;
}

type CounterField =
  | "guests"
  | "bedrooms"
  | "beds"
  | "baths";

const PropertyDetailsTab = <T extends PropertyFormUnion>({
  isVisible,
  form,
  errors,
  navigateBack,
  navigateNext,
}: PropertyDetailsTabProps<T>) => {
  if (!isVisible) return null;

  // Type-safe function to handle counter changes
  const handleCounterChange = (
    name: CounterField,
    value: number
  ) => {
    form.setValue(name as any, value as any);
  };

  const formValues = form.getValues();

  // Helper function to render counter inputs
  const renderCounter = (
    field: CounterField,
    label: string
  ) => {
    const currentValue = Number(formValues[field]) || 1;
    const fieldError = errors?.[field];

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
        <div className="flex items-center">
          <button
            type="button"
            onClick={() =>
              handleCounterChange(
                field,
                Math.max(1, currentValue - 1)
              )
            }
            className="p-2 border border-gray-300 rounded-l-lg hover:bg-gray-100"
          >
            -
          </button>
          <span
            className={`px-4 py-2 border-t border-b ${
              fieldError
                ? "border-red-500"
                : "border-gray-300"
            } min-w-16 text-center`}
          >
            {currentValue}
          </span>
          <button
            type="button"
            onClick={() =>
              handleCounterChange(field, currentValue + 1)
            }
            className="p-2 border border-gray-300 rounded-r-lg hover:bg-gray-100"
          >
            +
          </button>
        </div>
        {fieldError && (
          <p className="text-sm text-red-500 mt-1">
            {fieldError}
          </p>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <User className="text-primary" size={24} />
        <h2 className="text-xl font-semibold">
          Accommodation details
        </h2>
      </div>

      <p className="text-gray-600 mb-6">
        Let guests know how many people can stay and what
        amenities are available
      </p>

      <div className="space-y-6">
        {renderCounter(
          "guests",
          "Maximum number of guests"
        )}
        {renderCounter("bedrooms", "Number of bedrooms")}
        {renderCounter("beds", "Number of beds")}
        {renderCounter("baths", "Number of bathrooms")}
      </div>

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
          Next: Amenities
        </Button>
      </div>
    </div>
  );
};

export default PropertyDetailsTab;
