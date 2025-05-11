"use client";

import { FaStar } from "react-icons/fa";
import { useQuery } from "@apollo/client";
import { GET_PROPERTY_RATING_QUERY } from "@/graphql/review";

function PropertyRating({
  propertyId,
  inPage,
}: {
  propertyId: string;
  inPage: boolean;
}) {
  const { data, loading, error } = useQuery(
    GET_PROPERTY_RATING_QUERY,
    {
      variables: { propertyId },
    }
  );

  if (loading || error || !data) return null;

  const { rating, count } = data.propertyRating;

  if (count === 0) return null;

  const className = `flex gap-1 items-center ${
    inPage ? "text-md" : "text-xs"
  }`;
  const countText = count === 1 ? "review" : "reviews";
  const countValue = `(${count}) ${
    inPage ? countText : ""
  }`;

  return (
    <span className={className}>
      <FaStar className="w-3 h-3" />
      {rating}
      {countValue}
    </span>
  );
}

export default PropertyRating;
