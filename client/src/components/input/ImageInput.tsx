"use client";

import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ChangeEvent } from "react";

interface ImageInputProps {
  onChange?: (imageData: string) => void;
}

function ImageInput({ onChange }: ImageInputProps) {
  const name = "image";

  const handleFileChange = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        onChange?.(result);
      };
      reader.readAsDataURL(file);
    }
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
      />
    </div>
  );
}

export default ImageInput;
