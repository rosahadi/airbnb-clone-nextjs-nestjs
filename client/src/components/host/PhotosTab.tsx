"use client";

import React from "react";
import { Camera } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  PropertyError,
  PropertyFormUnion,
} from "@/types/property";
import ImageInput from "@/components/input/ImageInput";
import Image from "next/image";

interface PhotosTabProps<T extends PropertyFormUnion> {
  isVisible: boolean;
  form: UseFormReturn<T>;
  errors: PropertyError | null;
  navigateBack: () => void;
  navigateNext: () => void;
  previewImage: string | null;
  onImageChange: (file: File) => void;
}

const PhotosTab = <T extends PropertyFormUnion>({
  isVisible,
  errors,
  navigateBack,
  navigateNext,
  previewImage,
  onImageChange,
}: PhotosTabProps<T>) => {
  if (!isVisible) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Camera className="text-primary" size={24} />
        <h2 className="text-xl font-semibold">
          Add photos of your place
        </h2>
      </div>
      <p className="text-gray-600 mb-6">
        Great photos help guests imagine staying in your
        place
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <ImageInput onChange={onImageChange} />
          {errors?.image && (
            <p className="text-sm text-red-500 mt-1">
              {errors.image}
            </p>
          )}
        </div>

        <div className="rounded-lg flex items-center justify-center">
          {previewImage ? (
            <div className="relative w-full h-64 rounded-xl overflow-hidden shadow-md group">
              <div className="relative w-full h-full">
                <Image
                  src={previewImage}
                  alt="Property preview"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  priority={false}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          ) : (
            <div className="w-full h-64 flex flex-col items-center justify-center bg-gray-50 p-6 rounded-xl border-2 border-dashed border-gray-300">
              <Camera
                size={40}
                className="text-gray-400 mb-3"
              />
              <p className="text-gray-500 text-center font-medium">
                Add a photo of your property
              </p>
              <p className="text-gray-400 text-sm text-center mt-1">
                High-quality images help attract more guests
              </p>
            </div>
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
          Review & Submit
        </Button>
      </div>
    </div>
  );
};

export default PhotosTab;
