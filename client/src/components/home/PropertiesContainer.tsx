"use client";
import PropertiesList from "./PropertiesList";
import EmptyList from "./EmptyList";
import { useProperties } from "@/hooks/useProperty";
import { PropertyFilterData } from "@/types/property";
import Loader from "../Loader";

export default function PropertiesContainer({
  category,
  search,
}: {
  category?: string;
  search?: string;
}) {
  const filters: PropertyFilterData = {};

  if (category) filters.category = category;

  const { data, loading, error } = useProperties(filters);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyList
        heading="Something went wrong"
        message="We couldn't load properties at this time. Please try again later."
        btnText="Try again"
      />
    );
  }

  const properties = data?.properties || [];

  if (properties.length === 0) {
    return (
      <EmptyList
        heading={
          search
            ? "No properties match your search"
            : "No properties in this category"
        }
        message={
          search
            ? `We couldn't find any properties matching "${search}". Try a different search term.`
            : "Try selecting a different category or removing some filters."
        }
        btnText={
          search ? "Clear search" : "See all properties"
        }
      />
    );
  }

  return (
    <div className="mt-2">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-medium text-gray-900">
          {properties.length}{" "}
          {properties.length === 1
            ? "property"
            : "properties"}{" "}
          {category ? `in ${category}` : ""}
        </h2>
      </div>
      <PropertiesList properties={properties} />
    </div>
  );
}
