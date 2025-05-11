"use client";
import { Property } from "@/types/property";
import PropertyCard from "../card/PropertyCard";

function PropertiesList({
  properties,
}: {
  properties: Property[];
}) {
  return (
    <section className="mt-8 gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {properties.map((property) => (
        <PropertyCard
          key={property.id}
          property={property}
        />
      ))}
    </section>
  );
}

export default PropertiesList;
