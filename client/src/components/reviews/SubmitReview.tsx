"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@apollo/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { CREATE_REVIEW_MUTATION } from "@/graphql/review";
import { reviewSchema } from "@/schema/review";
import { ReviewFormData } from "@/types/review";

// Star rating component
function StarRating({
  rating,
  setRating,
}: {
  rating: number;
  setRating: (rating: number) => void;
}) {
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          type="button"
          key={star}
          onClick={() => setRating(star)}
          className="focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={star <= rating ? "currentColor" : "none"}
            stroke={
              star <= rating
                ? "currentColor"
                : "currentColor"
            }
            className={`w-8 h-8 ${
              star <= rating
                ? "text-yellow-400"
                : "text-gray-300"
            }`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={star <= rating ? "0" : "1.5"}
              d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
            />
          </svg>
        </button>
      ))}
    </div>
  );
}

function SubmitReview({
  propertyId,
}: {
  propertyId: string;
}) {
  const [isReviewFormVisible, setIsReviewFormVisible] =
    useState(false);
  const [createReview, { loading }] = useMutation(
    CREATE_REVIEW_MUTATION
  );

  // Initialize form with react-hook-form and zod validation
  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      propertyId: propertyId,
      rating: 5,
      comment: "Amazing place!!!",
    },
  });

  // Custom state for rating since we'll use a custom UI component
  const [rating, setRating] = useState(5);

  // Update form value when rating changes
  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
    form.setValue("rating", newRating, {
      shouldValidate: true,
    });
  };

  const onSubmit = async (data: ReviewFormData) => {
    try {
      await createReview({
        variables: {
          createReviewInput: data,
        },
      });

      toast.success("Review submitted successfully!");
      setIsReviewFormVisible(false);
      form.reset();
    } catch (error) {
      toast.error(
        "Failed to submit review. Please try again."
      );
      console.error(error);
    }
  };

  return (
    <div className="mt-8">
      <Button
        onClick={() =>
          setIsReviewFormVisible((prev) => !prev)
        }
        variant="default"
      >
        {isReviewFormVisible ? "Cancel" : "Leave a Review"}
      </Button>

      {isReviewFormVisible && (
        <Card className="p-8 mt-4 shadow-md">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              {/* Hidden PropertyId field */}
              <input type="hidden" value={propertyId} />

              {/* Rating Field */}
              <FormField
                control={form.control}
                name="rating"
                render={() => (
                  <FormItem>
                    <FormLabel className="text-lg font-medium">
                      Rating
                    </FormLabel>
                    <FormControl>
                      <StarRating
                        rating={rating}
                        setRating={handleRatingChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Comment Field */}
              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-medium">
                      Feedback
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Share your experience with this property..."
                        className="min-h-[120px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full md:w-auto"
                disabled={loading}
              >
                {loading
                  ? "Submitting..."
                  : "Submit Review"}
              </Button>
            </form>
          </Form>
        </Card>
      )}
    </div>
  );
}

export default SubmitReview;
