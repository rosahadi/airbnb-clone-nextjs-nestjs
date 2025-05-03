import React from "react";
import {
  CheckCircle,
  Camera,
  ChevronRight,
} from "lucide-react";
import { TabType } from "./TabNavigation";
import Image from "next/image";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  PropertyFormData,
  PropertyError,
} from "@/types/property";

interface ReviewTabProps {
  isVisible: boolean;
  form: UseFormReturn<PropertyFormData>;
  errors: PropertyError | null;
  previewImage: string | null;
  loading: boolean;
  navigateBack: () => void;
  navigateToTab: (tab: TabType) => void;
}

const ReviewTab: React.FC<ReviewTabProps> = ({
  isVisible,
  form,
  errors,
  previewImage,
  loading,
  navigateBack,
  navigateToTab,
}) => {
  const formData = form.watch();

  if (!isVisible) return null;

  // Sections with edit buttons
  const sections = [
    {
      title: "Basic Information",
      tab: "basics",
      fields: [
        { label: "Name", value: formData.name },
        { label: "Tagline", value: formData.tagline },
        { label: "Category", value: formData.category },
        { label: "Country", value: formData.country },
        {
          label: "Description",
          value: formData.description,
        },
        {
          label: "Price",
          value: `$${formData.price} per night`,
        },
      ],
    },
    {
      title: "Property Details",
      tab: "details",
      fields: [
        { label: "Guests", value: formData.guests },
        { label: "Bedrooms", value: formData.bedrooms },
        { label: "Beds", value: formData.beds },
        { label: "Baths", value: formData.baths },
      ],
    },
    {
      title: "Amenities",
      tab: "amenities",
      fields: [
        {
          label: "Amenities",
          value: formData.amenities
            ? JSON.parse(formData.amenities).join(", ")
            : "No amenities selected",
        },
      ],
    },
  ];

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <CheckCircle className="text-primary" size={24} />
        <h2 className="text-xl font-semibold">
          Review your listing
        </h2>
      </div>
      <p className="text-gray-600 mb-6">
        Please review all information before submitting
      </p>

      <div className="space-y-6 mb-6">
        {sections.map((section) => (
          <div
            key={section.title}
            className="bg-gray-50 p-6 rounded-lg"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">
                {section.title}
              </h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  navigateToTab(section.tab as TabType)
                }
                className="text-primary hover:text-primary-hover flex items-center gap-1"
              >
                Edit
                <ChevronRight size={16} />
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {section.fields.map((field, index) => (
                <div key={index}>
                  <p className="text-sm text-gray-500">
                    {field.label}
                  </p>
                  <p className="font-medium">
                    {field.value ||
                      `(${field.label} required)`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Photo Preview Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">
              Photos
            </h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => navigateToTab("photos")}
              className="text-primary hover:text-primary-hover flex items-center gap-1"
            >
              Edit
              <ChevronRight size={16} />
            </Button>
          </div>

          {previewImage ? (
            <div className="mt-4">
              <div className="relative w-full h-64 rounded-xl overflow-hidden shadow-md">
                <Image
                  src={previewImage}
                  alt="Property preview"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Main Photo
              </p>
            </div>
          ) : (
            <div className="p-6 bg-red-50 text-red-500 rounded-xl text-center border border-red-100">
              <Camera size={28} className="mx-auto mb-2" />
              <p className="font-medium">
                Please add a property image
              </p>
              <p className="text-sm text-red-400 mt-1">
                Images are required for your listing
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Display all errors in the review tab if any exist */}
      {errors && Object.keys(errors).length > 0 && (
        <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-100">
          <p className="font-medium text-red-500 mb-2">
            Please fix the following issues:
          </p>
          <ul className="text-red-500 text-sm list-disc pl-5">
            {Object.entries(errors).map(([key, value]) => (
              <li key={key}>{value as string}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8 flex justify-between">
        <Button
          type="button"
          onClick={navigateBack}
          variant="outline"
        >
          Back
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="font-medium"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Publishing...
            </>
          ) : (
            "Publish Listing"
          )}
        </Button>
      </div>
    </div>
  );
};

export default ReviewTab;
