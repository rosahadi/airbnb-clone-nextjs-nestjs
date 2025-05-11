"use client";

import Title from "@/components/properties/Title";
import ReviewCard from "./ReviewCard";
import { useQuery } from "@apollo/client";
import { GET_PROPERTY_REVIEWS_QUERY } from "@/graphql/review";
import { Review } from "@/types/review";

function PropertyReviews({
  propertyId,
}: {
  propertyId: string;
}) {
  const { data, loading, error } = useQuery(
    GET_PROPERTY_REVIEWS_QUERY,
    {
      variables: { propertyId },
      errorPolicy: "all",
    }
  );

  if (loading)
    return (
      <div className="mt-8">
        <Title text="Reviews" />
        <div className="mt-4 text-muted-foreground">
          Loading reviews...
        </div>
      </div>
    );

  if (error) {
    console.error("Error fetching reviews:", error);
    return (
      <div className="mt-8">
        <Title text="Reviews" />
        <div className="mt-4 text-muted-foreground">
          Unable to load reviews at this time.
        </div>
      </div>
    );
  }

  const reviews = data?.propertyReviews || [];

  if (reviews.length < 1) {
    return (
      <div className="mt-8">
        <Title text="Reviews" />
        <div className="mt-4 text-muted-foreground">
          No reviews yet for this property.
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <Title text="Reviews" />
      <div className="grid md:grid-cols-2 gap-8 mt-4">
        {reviews.map((review: Review) => {
          const { id, comment, rating } = review;
          const name = review?.user?.name || "Anonymous";
          const profileImage =
            review?.user?.profileImage ||
            "/images/placeholder.jpg";

          const reviewInfo = {
            comment,
            rating,
            name,
            image: profileImage,
          };

          return (
            <ReviewCard key={id} reviewInfo={reviewInfo} />
          );
        })}
      </div>
    </div>
  );
}

export default PropertyReviews;
