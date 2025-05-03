import { useState } from "react";
import { conservativeAmenities } from "@/utils/amenities";
import { IconType } from "react-icons";

type Amenity = {
  name: string;
  icon: IconType;
  selected: boolean;
};

interface AmenitiesInputProps {
  onChange?: (selectedAmenities: string[]) => void;
}

function AmenitiesInput({ onChange }: AmenitiesInputProps) {
  const [selectedAmenities, setSelectedAmenities] =
    useState<Amenity[]>(
      conservativeAmenities.map((amenity) => ({
        ...amenity,
        selected: false,
      }))
    );

  const handleToggleAmenity = (index: number) => {
    const updatedAmenities = [...selectedAmenities];
    updatedAmenities[index].selected =
      !updatedAmenities[index].selected;

    setSelectedAmenities(updatedAmenities);

    const selected = updatedAmenities
      .filter((amenity) => amenity.selected)
      .map((amenity) => amenity.name);

    onChange?.(selected);
  };

  return (
    <div className="mb-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {selectedAmenities.map((amenity, index) => {
          const Icon = amenity.icon;

          return (
            <div
              key={amenity.name}
              onClick={() => handleToggleAmenity(index)}
              className={`
                flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all
                ${
                  amenity.selected
                    ? "border-primary bg-rose-50 shadow-sm"
                    : "border-gray-200 hover:border-gray-300"
                }
              `}
            >
              <div
                className={`
                p-2 rounded-lg
                ${
                  amenity.selected
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-600"
                }
              `}
              >
                <Icon size={18} />
              </div>
              <span className="text-sm font-medium">
                {amenity.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AmenitiesInput;
