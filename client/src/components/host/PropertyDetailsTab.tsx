"use client";

import React from "react";
import { User } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  PropertyFormData,
  PropertyError,
} from "@/types/property";

interface PropertyDetailsTabProps {
  isVisible: boolean;
  form: UseFormReturn<PropertyFormData>;
  errors: PropertyError | null;
  navigateBack: () => void;
  navigateNext: () => void;
}

const PropertyDetailsTab: React.FC<
  PropertyDetailsTabProps
> = ({
  isVisible,
  form,
  errors,
  navigateBack,
  navigateNext,
}) => {
  if (!isVisible) return null;

  // Function to handle counter changes
  const handleCounterChange = (
    name: keyof PropertyFormData,
    value: number
  ) => {
    form.setValue(name, value);
  };

  // Get form values
  const formValues = form.getValues();

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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Maximum number of guests
          </label>
          <div className="flex items-center">
            <button
              type="button"
              onClick={() =>
                handleCounterChange(
                  "guests",
                  Math.max(1, formValues.guests - 1)
                )
              }
              className="p-2 border border-gray-300 rounded-l-lg hover:bg-gray-100"
            >
              -
            </button>
            <span
              className={`px-4 py-2 border-t border-b ${
                errors?.guests
                  ? "border-red-500"
                  : "border-gray-300"
              } min-w-16 text-center`}
            >
              {formValues.guests}
            </span>
            <button
              type="button"
              onClick={() =>
                handleCounterChange(
                  "guests",
                  formValues.guests + 1
                )
              }
              className="p-2 border border-gray-300 rounded-r-lg hover:bg-gray-100"
            >
              +
            </button>
          </div>
          {errors?.guests && (
            <p className="text-sm text-red-500 mt-1">
              {errors.guests}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of bedrooms
          </label>
          <div className="flex items-center">
            <button
              type="button"
              onClick={() =>
                handleCounterChange(
                  "bedrooms",
                  Math.max(1, formValues.bedrooms - 1)
                )
              }
              className="p-2 border border-gray-300 rounded-l-lg hover:bg-gray-100"
            >
              -
            </button>
            <span
              className={`px-4 py-2 border-t border-b ${
                errors?.bedrooms
                  ? "border-red-500"
                  : "border-gray-300"
              } min-w-16 text-center`}
            >
              {formValues.bedrooms}
            </span>
            <button
              type="button"
              onClick={() =>
                handleCounterChange(
                  "bedrooms",
                  formValues.bedrooms + 1
                )
              }
              className="p-2 border border-gray-300 rounded-r-lg hover:bg-gray-100"
            >
              +
            </button>
          </div>
          {errors?.bedrooms && (
            <p className="text-sm text-red-500 mt-1">
              {errors.bedrooms}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of beds
          </label>
          <div className="flex items-center">
            <button
              type="button"
              onClick={() =>
                handleCounterChange(
                  "beds",
                  Math.max(1, formValues.beds - 1)
                )
              }
              className="p-2 border border-gray-300 rounded-l-lg hover:bg-gray-100"
            >
              -
            </button>
            <span
              className={`px-4 py-2 border-t border-b ${
                errors?.beds
                  ? "border-red-500"
                  : "border-gray-300"
              } min-w-16 text-center`}
            >
              {formValues.beds}
            </span>
            <button
              type="button"
              onClick={() =>
                handleCounterChange(
                  "beds",
                  formValues.beds + 1
                )
              }
              className="p-2 border border-gray-300 rounded-r-lg hover:bg-gray-100"
            >
              +
            </button>
          </div>
          {errors?.beds && (
            <p className="text-sm text-red-500 mt-1">
              {errors.beds}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of bathrooms
          </label>
          <div className="flex items-center">
            <button
              type="button"
              onClick={() =>
                handleCounterChange(
                  "baths",
                  Math.max(1, formValues.baths - 1)
                )
              }
              className="p-2 border border-gray-300 rounded-l-lg hover:bg-gray-100"
            >
              -
            </button>
            <span
              className={`px-4 py-2 border-t border-b ${
                errors?.baths
                  ? "border-red-500"
                  : "border-gray-300"
              } min-w-16 text-center`}
            >
              {formValues.baths}
            </span>
            <button
              type="button"
              onClick={() =>
                handleCounterChange(
                  "baths",
                  formValues.baths + 1
                )
              }
              className="p-2 border border-gray-300 rounded-r-lg hover:bg-gray-100"
            >
              +
            </button>
          </div>
          {errors?.baths && (
            <p className="text-sm text-red-500 mt-1">
              {errors.baths}
            </p>
          )}
        </div>
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
