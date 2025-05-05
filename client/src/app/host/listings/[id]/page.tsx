"use client";

import React, { useState, useEffect, use } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { toast } from "sonner";
import {
  GET_PROPERTY_QUERY,
  UPDATE_PROPERTY_MUTATION,
} from "@/graphql/property";
import Container from "@/components/Container";
import { useRouter } from "next/navigation";
import { PropertyForm } from "@/components/host/PropertyForm";
import { usePropertyForm } from "@/hooks/usePropertyForm";
import { AlertCircle } from "lucide-react";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import Loader from "@/components/Loader";
import { TabType } from "@/components/host/TabNavigation";
import {
  PropertyIdParams,
  UpdatePropertyFormData,
} from "@/types/property";
import {
  formatGraphQLError,
  getChangedValues,
} from "@/utils/propertyFormUtils";

interface EditPropertyPageProps {
  params: Promise<PropertyIdParams>;
}

const EditPropertyPage: React.FC<EditPropertyPageProps> = ({
  params,
}) => {
  const { id } = use(params);
  const router = useRouter();
  const [selectedTab, setSelectedTab] =
    useState<TabType>("basics");
  const [originalValues, setOriginalValues] =
    useState<UpdatePropertyFormData | null>(null);

  const {
    form,
    previewImage,
    error,
    setPreviewImage,
    setError,
    handleImageChange,
    handleAmenitiesChange,
    validateTabForm,
  } = usePropertyForm(true);

  const {
    data,
    loading: fetchLoading,
    error: fetchError,
  } = useQuery(GET_PROPERTY_QUERY, {
    variables: { id },
  });

  const [updateProperty, { loading: updateLoading }] =
    useMutation(UPDATE_PROPERTY_MUTATION, {
      onCompleted: () => {
        toast.success("Property updated successfully!");
        router.push(`/host/listings`);
      },
      onError: (error) => {
        const formattedError = formatGraphQLError(error);
        setError(formattedError);
        toast.error("Error updating property", {
          description: formattedError.general,
        });
      },
    });

  useEffect(() => {
    if (data?.property) {
      const property = data.property;
      const initialValues = {
        name: property.name,
        tagline: property.tagline,
        category: property.category,
        country: property.country,
        description: property.description,
        price: property.price,
        guests: property.guests,
        bedrooms: property.bedrooms,
        beds: property.beds,
        baths: property.baths,
        amenities: property.amenities,
        image: property.image,
      };

      setOriginalValues(initialValues);
      form.reset(initialValues);

      if (property.image) {
        setPreviewImage(
          property.image.startsWith("http")
            ? property.image
            : `data:image/jpeg;base64,${property.image}`
        );
      }
    }
  }, [data, form, setPreviewImage]);

  const onSubmit = async () => {
    try {
      setError(null);
      if (!originalValues) return;

      const changedValues = getChangedValues(
        form.getValues(),
        originalValues
      );
      if (Object.keys(changedValues).length === 0) {
        toast.info("No changes detected");
        return;
      }

      await updateProperty({
        variables: {
          id,
          updatePropertyInput: changedValues,
        },
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred";
      setError({ general: errorMessage });
    }
  };

  if (fetchLoading) return <Loader />;
  if (fetchError) return <div>error</div>;

  return (
    <Container>
      <div className="pb-10 pt-12 mx-auto w-full max-w-[1000px]">
        <h1 className="text-2xl font-semibold mb-8 capitalize">
          Edit Property:{" "}
          {data?.property?.name || "Loading..."}
        </h1>

        {error?.general && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error.general}
            </AlertDescription>
          </Alert>
        )}

        <PropertyForm
          form={form}
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
          previewImage={previewImage}
          error={error}
          handleImageChange={handleImageChange}
          handleAmenitiesChange={handleAmenitiesChange}
          validateTabForm={validateTabForm}
          isEditMode={true}
          loading={updateLoading}
          onSubmit={onSubmit}
        />
      </div>
    </Container>
  );
};

export default EditPropertyPage;
