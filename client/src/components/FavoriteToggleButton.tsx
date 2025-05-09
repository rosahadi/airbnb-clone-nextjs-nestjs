"use client";
import { useMutation, useQuery } from "@apollo/client";
import { FaHeart } from "react-icons/fa";
import {
  CHECK_FAVORITE_STATUS_QUERY,
  TOGGLE_FAVORITE_MUTATION,
} from "@/graphql/favorite";
import { useAuth } from "@/stores/authStore";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { Form } from "./ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { favoriteSchema } from "@/schema/favorite";
import { FavoriteData } from "@/types/favorite";

interface FavoriteToggleButtonProps {
  propertyId: string;
  propertyName?: string;
}

export default function FavoriteToggleButton({
  propertyId,
  propertyName = "Property",
}: FavoriteToggleButtonProps) {
  const { isAuthenticated } = useAuth();
  const form = useForm<FavoriteData>({
    defaultValues: { propertyId },
    resolver: zodResolver(favoriteSchema),
  });

  // Check favorite status
  const { data, loading } = useQuery(
    CHECK_FAVORITE_STATUS_QUERY,
    {
      variables: { propertyId },
      skip: !isAuthenticated,
      onError: (error) => {
        toast.error("Failed to check favorite status", {
          description: error.message,
        });
      },
    }
  );

  // Toggle favorite mutation
  const [toggleFavorite] = useMutation(
    TOGGLE_FAVORITE_MUTATION,
    {
      refetchQueries: [
        {
          query: CHECK_FAVORITE_STATUS_QUERY,
          variables: { propertyId },
        },
        "GetMyFavorites",
      ],
      onError: (error) => {
        toast.error("Failed to update favorites", {
          description: error.message,
        });
      },
    }
  );

  const isFavorite =
    data?.checkFavoriteStatus?.isFavorite || false;

  async function onSubmit(data: FavoriteData) {
    if (!isAuthenticated) {
      toast.info("Login required", {
        description:
          "Please login to add this property to your favorites",
      });
      return;
    }

    try {
      const result = await toggleFavorite({
        variables: { propertyId: data.propertyId },
      });
      if (result.data?.toggleFavorite) {
        toast.success(
          isFavorite
            ? `Removed from favorites`
            : `Added to favorites`,
          {
            description: `${propertyName} ${
              isFavorite ? "removed from" : "added to"
            } your favorites list.`,
          }
        );
      } else if (isFavorite) {
        toast.success(`Removed from favorites`, {
          description: `${propertyName} removed from your favorites list.`,
        });
      }
    } catch {
      // Error handling is done in the mutation's onError callback
      return null;
    }
  }

  if (loading) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <FaHeart className="animate-pulse text-gray-400" />
      </Button>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Button
          type="submit"
          size="icon"
          variant="ghost"
          disabled={form.formState.isSubmitting}
          className="bg-white/90 hover:bg-white rounded-full h-8 w-8 shadow-md transition-all group"
        >
          <FaHeart
            size={18}
            className={
              isFavorite
                ? "text-primary"
                : "text-gray-400 group-hover:text-red-300"
            }
          />
        </Button>
      </form>
    </Form>
  );
}
