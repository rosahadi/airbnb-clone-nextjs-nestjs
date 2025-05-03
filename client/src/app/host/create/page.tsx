"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@apollo/client";
import { toast } from "sonner";
import { CREATE_PROPERTY_MUTATION } from "@/graphql/property/mutations";
import Container from "@/components/Container";
import { useRouter } from "next/navigation";
import { propertySchema } from "@/schema/property";
import {
  PropertyFormData,
  PropertyError,
} from "@/types/property";
import TabNavigation, {
  TabType,
} from "@/components/host/create/TabNavigation";
import { Form } from "@/components/ui/form";
import { AlertCircle } from "lucide-react";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";

// Tab components import
import BasicInfoTab from "@/components/host/create/BasicInfoTab";
import PropertyDetailsTab from "@/components/host/create/PropertyDetailsTab";
import AmenitiesTab from "@/components/host/create/AmenitiesTab";
import PhotosTab from "@/components/host/create/PhotosTab";
import ReviewTab from "@/components/host/create/ReviewTab";
import { formattedCountries } from "@/utils/countries";

const CreatePropertyPage: React.FC = () => {
  const router = useRouter();
  const [selectedTab, setSelectedTab] =
    useState<TabType>("basics");
  const [previewImage, setPreviewImage] = useState<
    string | null
  >(null);
  const [error, setError] = useState<PropertyError | null>(
    null
  );

  // Initialize form with default values
  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
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
      amenities: "",
      image: "",
    },
  });

  // GraphQL mutation
  const [createProperty, { loading }] = useMutation(
    CREATE_PROPERTY_MUTATION,
    {
      onCompleted: (data) => {
        toast.success("Property created successfully!", {
          description: "Your property is now live!",
        });
        router.push(
          `/properties/${data.createProperty.id}`
        );
      },
      onError: (error) => {
        const formattedError: PropertyError = {
          general: "Failed to create property",
        };

        if (error.graphQLErrors) {
          error.graphQLErrors.forEach((graphqlError) => {
            if (graphqlError.extensions?.validationErrors) {
              const validationErrors = graphqlError
                .extensions.validationErrors as Record<
                string,
                string
              >;
              Object.entries(validationErrors).forEach(
                ([field, message]) => {
                  formattedError[
                    field as keyof PropertyError
                  ] = Array.isArray(message)
                    ? message[0]
                    : message.toString();
                }
              );
            } else {
              formattedError.general =
                graphqlError.message ||
                "Error creating property";
            }
          });
        } else if (error.networkError) {
          formattedError.general =
            "Network error. Please check your connection and try again.";
        }

        setError(formattedError);
        toast.error("Error creating property", {
          description: formattedError.general,
        });
      },
    }
  );

  // Handle image changes
  const handleImageChange = (file: File | null) => {
    if (!file) {
      setPreviewImage(null);
      form.setValue("image", "");
      return;
    }

    // Update to 10MB limit for property images
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

  // Handle amenities selection
  const handleAmenitiesChange = (
    selectedAmenities: string[]
  ): void => {
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

  // Validate the current tab before navigating
  const validateTabForm = async (
    tab: TabType
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

    const results = await Promise.all(
      fieldsToValidate.map((field) => form.trigger(field))
    );
    return results.every((result) => result === true);
  };

  // Navigate to next tab with validation
  const navigateTab = async (
    currentTab: TabType,
    nextTab: TabType
  ): Promise<void> => {
    const isValid = await validateTabForm(currentTab);

    if (isValid) {
      setSelectedTab(nextTab);
    } else {
      toast.error(
        "Please fix the errors before proceeding",
        {
          description:
            "There are validation errors in your form",
        }
      );
    }
  };

  // Handle form submission
  const onSubmit = async (formData: PropertyFormData) => {
    try {
      setError(null);
      const createPropertyInput = {
        ...formData,
        price: Number(formData.price),
        guests: Number(formData.guests),
        bedrooms: Number(formData.bedrooms),
        beds: Number(formData.beds),
        baths: Number(formData.baths),
      };

      await createProperty({
        variables: {
          createPropertyInput,
        },
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred";
      setError({ general: errorMessage });
      toast.error("Error creating property", {
        description: errorMessage,
      });
    }
  };

  return (
    <Container>
      <div className="pb-10 pt-12 mx-auto w-full max-w-[1000px]">
        <h1 className="text-2xl font-semibold mb-8 capitalize">
          Create Your Property
        </h1>

        <TabNavigation
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
        />

        <div className="bg-white rounded-lg shadow-lg p-8">
          {error?.general && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error.general}
              </AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <BasicInfoTab
                isVisible={selectedTab === "basics"}
                form={form}
                errors={error}
                navigateTab={() =>
                  navigateTab("basics", "details")
                }
              />

              <PropertyDetailsTab
                isVisible={selectedTab === "details"}
                form={form}
                errors={error}
                navigateBack={() =>
                  setSelectedTab("basics")
                }
                navigateNext={() =>
                  navigateTab("details", "amenities")
                }
              />

              <AmenitiesTab
                isVisible={selectedTab === "amenities"}
                form={form}
                errors={error}
                handleAmenitiesChange={
                  handleAmenitiesChange
                }
                navigateBack={() =>
                  setSelectedTab("details")
                }
                navigateNext={() =>
                  navigateTab("amenities", "photos")
                }
              />

              <PhotosTab
                isVisible={selectedTab === "photos"}
                form={form}
                errors={error}
                previewImage={previewImage}
                navigateBack={() =>
                  setSelectedTab("amenities")
                }
                onImageChange={handleImageChange}
                navigateNext={() =>
                  navigateTab("photos", "review")
                }
              />

              <ReviewTab
                isVisible={selectedTab === "review"}
                form={form}
                errors={error}
                previewImage={previewImage}
                loading={loading}
                navigateBack={() =>
                  setSelectedTab("photos")
                }
                navigateToTab={setSelectedTab}
              />
            </form>
          </Form>
        </div>
      </div>
    </Container>
  );
};

export default CreatePropertyPage;
