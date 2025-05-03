"use client";

import { ChangeEvent, useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

interface ImageInputProps {
  onChange?: (file: File) => void;
}

function ImageInput({ onChange }: ImageInputProps) {
  const name = "image";
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    onChange?.(file);
    setIsLoading(false);
  };

  return (
    <div className="mb-2">
      <Label htmlFor={name} className="capitalize">
        Image
      </Label>
      <Input
        id={name}
        name={name}
        type="file"
        required
        accept="image/*"
        className="max-w-xs"
        onChange={handleFileChange}
        disabled={isLoading}
      />
      {isLoading && (
        <p className="text-xs text-gray-500 mt-1">
          Processing image...
        </p>
      )}
    </div>
  );
}

export default ImageInput;
