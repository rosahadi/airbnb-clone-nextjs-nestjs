"use client";
import { useQuery } from "@apollo/client";
import { GET_MY_FAVORITES_QUERY } from "@/graphql/favorite";
import EmptyList from "@/components/home/EmptyList";
import PropertiesList from "@/components/home/PropertiesList";
import { useAuth } from "@/stores/authStore";
import { toast } from "sonner";
import Container from "@/components/Container";
import { Favorite } from "@/types/favorite";
import Loader from "@/components/Loader";

function FavoritesPage() {
  const { isAuthenticated } = useAuth();

  const { data, error, loading } = useQuery(
    GET_MY_FAVORITES_QUERY,
    {
      skip: !isAuthenticated,
      onError: (error) => {
        toast.error("Failed to fetch favorites", {
          description: error.message,
        });
      },
    }
  );

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Error</h2>
        <p>There was an error loading your favorites.</p>
      </div>
    );
  }

  const favorites = data?.myFavorites || [];

  if (favorites.length === 0) {
    return <EmptyList />;
  }

  const favoriteProperties = favorites.map(
    (favorite: Favorite) => favorite.property
  );

  return (
    <Container>
      <PropertiesList properties={favoriteProperties} />
    </Container>
  );
}

export default FavoritesPage;
