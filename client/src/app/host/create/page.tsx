"use client";

import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { toast } from "sonner";
import { CREATE_PROPERTY_MUTATION } from "@/graphql/property";
import Container from "@/components/Container";
import { useRouter } from "next/navigation";
import { PropertyForm } from "@/components/host/PropertyForm";
import { usePropertyForm } from "@/hooks/usePropertyForm";
import { AlertCircle } from "lucide-react";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import { TabType } from "@/components/host/TabNavigation";
import { PropertyFormData } from "@/types/property";
import { formatGraphQLError } from "@/utils/propertyFormUtils";

const CreatePropertyPage: React.FC = () => {
  const router = useRouter();
  const [selectedTab, setSelectedTab] =
    useState<TabType>("basics");
  const {
    form,
    previewImage,
    error,
    setError,
    handleImageChange,
    handleAmenitiesChange,
    validateTabForm,
  } = usePropertyForm();

  const [createProperty, { loading }] = useMutation(
    CREATE_PROPERTY_MUTATION,
    {
      onCompleted: (data) => {
        toast.success("Property created successfully!");
        router.push(
          `/properties/${data.createProperty.id}`
        );
      },
      onError: (error) => {
        const formattedError = formatGraphQLError(error);
        setError(formattedError);
        toast.error("Error creating property", {
          description: formattedError.general,
        });
      },
    }
  );

  const onSubmit = async (formData: PropertyFormData) => {
    try {
      setError(null);
      await createProperty({
        variables: {
          createPropertyInput: formData,
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

  return (
    <Container>
      <div className="pb-10 pt-12 mx-auto w-full max-w-[1000px]">
        <h1 className="text-2xl font-semibold mb-8 capitalize">
          Create Your Property
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
          loading={loading}
          onSubmit={(data) =>
            onSubmit(data as PropertyFormData)
          }
        />
      </div>
    </Container>
  );
};

export default CreatePropertyPage;
