import Image from "next/image";
import Link from "next/link";
import CountryFlagAndName from "./CountryFlagAndName";
import PropertyRating from "./PropertyRating";
import { formatCurrency } from "@/utils/format";
import FavoriteToggleButton from "../FavoriteToggleButton";
import { Property } from "@/types/property";

function PropertyCard({
  property,
}: {
  property: Property;
}) {
  const { name, image, price } = property;
  const { country, id: propertyId, tagline } = property;

  return (
    <article className="group relative bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
      <Link
        href={`/properties/${propertyId}`}
        className="block"
      >
        <div className="relative h-[240px] overflow-hidden rounded-t-xl">
          <Image
            src={image}
            fill
            sizes="(max-width:768px) 100vw, (max-width:1024px) 50vw, 25vw"
            alt={name}
            className="object-cover transform group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="p-4">
          <div className="flex justify-between items-start">
            <h3 className="text-base font-medium text-gray-900 line-clamp-1">
              {name}
            </h3>
            <PropertyRating
              inPage={false}
              propertyId={propertyId}
            />
          </div>
          <p className="text-sm mt-1 text-gray-500 line-clamp-1">
            {tagline}
          </p>
          <div className="flex justify-between items-center mt-2">
            <div>
              <p className="text-sm">
                <span className="font-semibold text-gray-900">
                  {formatCurrency(price)}
                </span>
                <span className="text-gray-600">
                  {" "}
                  night
                </span>
              </p>
            </div>
            <CountryFlagAndName countryCode={country} />
          </div>
        </div>
      </Link>
      <div className="absolute top-3 right-3">
        <FavoriteToggleButton propertyId={propertyId} />
      </div>
    </article>
  );
}

export default PropertyCard;
