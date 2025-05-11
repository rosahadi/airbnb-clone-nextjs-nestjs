import LoadingCards from "@/components/card/LoadingCards";
import Container from "@/components/Container";
import CategoriesList from "@/components/home/CategoriesList";
import PropertiesContainer from "@/components/home/PropertiesContainer";
import { Suspense } from "react";

export default async function HomePage({
  searchParams,
}: {
  searchParams: { category?: string; search?: string };
}) {
  const params = await searchParams;
  const category = params.category || undefined;

  return (
    <Container>
      <CategoriesList />
      <Suspense fallback={<LoadingCards />}>
        <PropertiesContainer category={category} />
      </Suspense>
    </Container>
  );
}
