import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  propertySchema,
  updatePropertySchema,
} from "@/schema/property";
import { formattedCountries } from "@/utils/countries";
import {
  PropertyFormData,
  UpdatePropertyFormData,
  PropertyError,
} from "@/types/property";
import { TabType } from "@/components/host/TabNavigation";

export const usePropertyForm = (
  isEditMode = false,
  initialValues?: UpdatePropertyFormData
) => {
  const [previewImage, setPreviewImage] = useState<
    string | null
  >(null);
  const [error, setError] = useState<PropertyError | null>(
    null
  );

  const form = useForm<
    PropertyFormData | UpdatePropertyFormData
  >({
    resolver: zodResolver(
      isEditMode ? updatePropertySchema : propertySchema
    ),
    defaultValues: initialValues || {
      name: "",
      tagline: "",
      category: "",
      country: formattedCountries[0].code,
      description: "",
      price: 0,
      guests: 1,
      bedrooms: 1,
      beds: 1,
      baths: 1,
      amenities: "[]",
      image: "",
    },
  });

  const handleImageChange = (file: File | null) => {
    if (!file) {
      setPreviewImage(null);
      form.setValue("image", "");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError((prev) => ({
        ...prev,
        image: "Image size should be less than 10MB",
      }));
      return;
    }

    const previewReader = new FileReader();
    previewReader.onload = () => {
      if (previewReader.result) {
        setPreviewImage(previewReader.result as string);
      }
    };
    previewReader.readAsDataURL(file);

    const dataReader = new FileReader();
    dataReader.onload = () => {
      if (dataReader.result) {
        const base64String = dataReader.result as string;
        const base64Data = base64String.split(",")[1];
        form.setValue("image", base64Data || "");
      }
    };
    dataReader.readAsDataURL(file);

    if (error?.image) {
      setError((prev) => {
        if (!prev) return null;
        const newErrors = { ...prev };
        delete newErrors.image;
        return Object.keys(newErrors).length > 0
          ? newErrors
          : null;
      });
    }
  };

  const handleAmenitiesChange = (
    selectedAmenities: string[]
  ) => {
    const amenitiesString = JSON.stringify(
      selectedAmenities
    );
    form.setValue("amenities", amenitiesString);

    if (error?.amenities) {
      setError((prev) => {
        if (!prev) return null;
        const newErrors = { ...prev };
        delete newErrors.amenities;
        return Object.keys(newErrors).length > 0
          ? newErrors
          : null;
      });
    }
  };

  const validateTabForm = async (
    tab: TabType,
    isEditMode: boolean
  ): Promise<boolean> => {
    let fieldsToValidate: Array<keyof PropertyFormData> =
      [];

    switch (tab) {
      case "basics":
        fieldsToValidate = [
          "name",
          "tagline",
          "category",
          "country",
          "description",
          "price",
        ];
        break;
      case "details":
        fieldsToValidate = [
          "guests",
          "bedrooms",
          "beds",
          "baths",
        ];
        break;
      case "amenities":
        fieldsToValidate = ["amenities"];
        break;
      case "photos":
        fieldsToValidate = ["image"];
        break;
    }

    // In edit mode, only validate dirty fields
    if (isEditMode) {
      fieldsToValidate = fieldsToValidate.filter(
        (field) => form.getFieldState(field).isDirty
      );
    }

    if (fieldsToValidate.length === 0) return true;

    const results = await Promise.all(
      fieldsToValidate.map((field) => form.trigger(field))
    );
    return results.every((result) => result === true);
  };

  return {
    form,
    previewImage,
    error,
    setPreviewImage,
    setError,
    handleImageChange,
    handleAmenitiesChange,
    validateTabForm,
  };
};
