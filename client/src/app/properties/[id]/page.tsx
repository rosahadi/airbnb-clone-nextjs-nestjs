"use client";

import React, { use } from "react";
import PropertyRating from "@/components/card/PropertyRating";
import BreadCrumbs from "@/components/properties/BreadCrumbs";
import ImageContainer from "@/components/properties/ImageContainer";
import PropertyDetails from "@/components/properties/PropertyDetails";
import ShareButton from "@/components/properties/ShareButton";
import UserInfo from "@/components/properties/UserInfo";
import { Separator } from "@/components/ui/separator";
import Description from "@/components/properties/Description";
import Amenities from "@/components/properties/Amenities";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import SubmitReview from "@/components/reviews/SubmitReview";
import PropertyReviews from "@/components/reviews/PropertyReviews";
import FavoriteToggleButton from "@/components/FavoriteToggleButton";
import { useQuery } from "@apollo/client";
import { GET_PROPERTY_QUERY } from "@/graphql/property";
import { useAuth } from "@/stores/authStore";
import { GET_PROPERTY_REVIEWS_QUERY } from "@/graphql/review";
import Link from "next/link";
import { Review } from "@/types/review";
import Container from "@/components/Container";

const DynamicMap = dynamic(
  () => import("@/components/properties/PropertyMap"),
  {
    ssr: false,
    loading: () => (
      <Skeleton className="h-[400px] w-full" />
    ),
  }
);

interface PropertyIdParams {
  id: string;
}

interface PropertyDetailsPageProps {
  params: Promise<PropertyIdParams>;
}

function PropertyDetailsPage({
  params,
}: PropertyDetailsPageProps) {
  const { id } = use(params);

  const { loading, data } = useQuery(GET_PROPERTY_QUERY, {
    variables: { id },
    fetchPolicy: "cache-and-network",
    skip: !id,
  });

  const { user } = useAuth();

  const { data: reviewsData } = useQuery(
    GET_PROPERTY_REVIEWS_QUERY,
    {
      variables: { propertyId: id },
      skip: !id,
      errorPolicy: "all",
    }
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Skeleton className="h-[600px] w-full max-w-4xl" />
      </div>
    );
  }

  const property = data?.property;

  const DynamicBookingWrapper = dynamic(
    () => import("@/components/booking/BookingWrapper"),
    {
      ssr: false,
      loading: () => (
        <Skeleton className="h-[200px] w-full" />
      ),
    }
  );

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold">
          Property not found
        </h1>
        <p className="mt-4">
          The property you are looking for does not exist or
          was removed.
        </p>
        <Link
          href="/"
          className="mt-6 text-blue-500 underline"
        >
          Return to home page
        </Link>
      </div>
    );
  }

  const { baths, bedrooms, beds, guests } = property;
  const details = { baths, bedrooms, beds, guests };

  const firstName =
    property.user?.name?.split(" ")[0] || "Host";
  const profileImage =
    property.user?.profileImage ||
    "/images/placeholder.jpg";

  const hasReviewed = reviewsData?.propertyReviews?.some(
    (review: Review) => review.user?.id === user?.id
  );

  const reviewDoesNotExist = user && !hasReviewed;

  return (
    <Container>
      <div className="pt-10 mx-auto w-full max-w-[1000px]">
        <BreadCrumbs name={property.name} />
        <header className="flex justify-between items-center mt-4">
          <h1 className="text-4xl font-bold capitalize">
            {property.tagline}
          </h1>
          <div className="flex items-center gap-x-4">
            <ShareButton
              name={property.name}
              propertyId={property.id}
            />
            <FavoriteToggleButton
              propertyId={property.id}
            />
          </div>
        </header>
        <ImageContainer
          mainImage={property.image}
          name={property.name}
        />
        <section className="lg:grid lg:grid-cols-12 gap-x-12 mt-12">
          <div className="lg:col-span-12">
            <div className="flex gap-x-4 items-center">
              <h1 className="text-xl font-bold">
                {property.name}{" "}
              </h1>
              <PropertyRating
                inPage
                propertyId={property.id}
              />
            </div>
            <PropertyDetails details={details} />
            <UserInfo
              profile={{ firstName, profileImage }}
            />
            <Separator className="mt-4" />
            <Description
              description={property.description}
            />
            <Amenities amenities={property.amenities} />
            <DynamicMap countryCode={property.country} />
          </div>
          <div className="lg:col-span-4 flex flex-col items-center">
            {/* calendar */}
            <DynamicBookingWrapper
              propertyId={property.id}
              price={property.price}
              bookings={property.bookings}
            />
          </div>
        </section>
        {reviewDoesNotExist && (
          <SubmitReview propertyId={property.id} />
        )}
        <PropertyReviews propertyId={property.id} />
      </div>
    </Container>
  );
}
export default PropertyDetailsPage;
