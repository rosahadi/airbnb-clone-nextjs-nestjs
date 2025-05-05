import React from "react";
import { Form } from "@/components/ui/form";
import TabNavigation, {
  TabType,
} from "@/components/host/TabNavigation";
import BasicInfoTab from "@/components/host/BasicInfoTab";
import PropertyDetailsTab from "@/components/host/PropertyDetailsTab";
import AmenitiesTab from "@/components/host/AmenitiesTab";
import PhotosTab from "@/components/host/PhotosTab";
import ReviewTab from "@/components/host/ReviewTab";
import {
  PropertyError,
  PropertyFormData,
  UpdatePropertyFormData,
} from "@/types/property";
import { UseFormReturn } from "react-hook-form";

interface PropertyFormProps {
  form: UseFormReturn<
    PropertyFormData | UpdatePropertyFormData
  >;
  selectedTab: TabType;
  setSelectedTab: (tab: TabType) => void;
  previewImage: string | null;
  error: PropertyError | null;
  handleImageChange: (file: File | null) => void;
  handleAmenitiesChange: (amenities: string[]) => void;
  validateTabForm: (
    tab: TabType,
    isEditMode: boolean
  ) => Promise<boolean>;
  isEditMode?: boolean;
  loading?: boolean;
  onSubmit: (
    data: PropertyFormData | UpdatePropertyFormData
  ) => Promise<void>;
}

export const PropertyForm: React.FC<PropertyFormProps> = ({
  form,
  selectedTab,
  setSelectedTab,
  previewImage,
  error,
  handleImageChange,
  handleAmenitiesChange,
  validateTabForm,
  loading = false,
  isEditMode = false,
  onSubmit,
}) => {
  const navigateTab = async (
    currentTab: TabType,
    nextTab: TabType
  ) => {
    const isValid = await validateTabForm(
      currentTab,
      !!isEditMode
    );
    if (isValid) {
      setSelectedTab(nextTab);
    }
  };

  return (
    <>
      <TabNavigation
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
      />

      <div className="bg-white rounded-lg shadow-lg p-8">
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
              navigateBack={() => setSelectedTab("basics")}
              navigateNext={() =>
                navigateTab("details", "amenities")
              }
            />

            <AmenitiesTab
              isVisible={selectedTab === "amenities"}
              form={form}
              errors={error}
              handleAmenitiesChange={handleAmenitiesChange}
              navigateBack={() => setSelectedTab("details")}
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
              navigateBack={() => setSelectedTab("photos")}
              navigateToTab={setSelectedTab}
            />
          </form>
        </Form>
      </div>
    </>
  );
};
