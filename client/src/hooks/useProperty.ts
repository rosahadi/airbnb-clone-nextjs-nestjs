"use client";

import {
  useQuery,
  useMutation,
  useLazyQuery,
} from "@apollo/client";
import {
  GET_MY_PROPERTIES_QUERY,
  GET_PROPERTIES_QUERY,
  GET_PROPERTY_QUERY,
  DELETE_PROPERTY_MUTATION,
  SEARCH_PROPERTIES_QUERY,
} from "@/graphql/property";
import {
  Property,
  PropertyFilterData,
  PropertySearchData,
  PropertySearchError,
} from "@/types/property";
import { useCallback, useState } from "react";
import { propertySearchSchema } from "@/schema/property";
import { z } from "zod";

export const useProperties = (
  filters?: PropertyFilterData
) => {
  return useQuery(GET_PROPERTIES_QUERY, {
    variables: { filters },
    fetchPolicy: "cache-and-network",
  });
};

export const useProperty = (id: string) => {
  return useQuery(GET_PROPERTY_QUERY, {
    variables: { id },
    fetchPolicy: "cache-and-network",
    skip: !id,
  });
};

export const useMyProperties = () => {
  return useQuery(GET_MY_PROPERTIES_QUERY, {
    fetchPolicy: "cache-and-network",
  });
};

export const useDeleteProperty = (
  propertyId: string,
  onSuccess?: () => void
) => {
  return useMutation(DELETE_PROPERTY_MUTATION, {
    variables: { id: propertyId },
    onCompleted: onSuccess,
    update: (cache) => {
      cache.modify({
        fields: {
          myProperties: (
            existingProperties = [],
            { readField }
          ) => {
            return existingProperties.filter(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (propertyRef: any) =>
                propertyId !== readField("id", propertyRef)
            );
          },
        },
      });
    },
  });
};

export const usePropertySearch = () => {
  const [searchProperties, { data, loading, error }] =
    useLazyQuery(SEARCH_PROPERTIES_QUERY, {
      fetchPolicy: "cache-and-network",
      errorPolicy: "all",
    });
  const [searchErrors, setSearchErrors] =
    useState<PropertySearchError>({});

  const validateAndSearch = useCallback(
    async (searchData: PropertySearchData) => {
      try {
        setSearchErrors({});

        if (
          !searchData.country &&
          !searchData.checkIn &&
          !searchData.checkOut &&
          !searchData.guests
        ) {
          await searchProperties({
            variables: { searchInput: {} },
          });
          return true;
        }

        let validatedData = searchData;
        try {
          if (propertySearchSchema) {
            validatedData =
              propertySearchSchema.parse(searchData);
          }
        } catch {
          // Silently fall back to original data if validation fails
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const searchInput: any = {
          country:
            validatedData.country?.trim() || undefined,
          guests: validatedData.guests || undefined,
        };

        if (validatedData.checkIn) {
          try {
            const checkInDate = new Date(
              validatedData.checkIn
            );
            if (!isNaN(checkInDate.getTime())) {
              searchInput.checkIn =
                checkInDate.toISOString();
            }
          } catch {
            // Silently fall back to original data if validation fails
          }
        }

        if (validatedData.checkOut) {
          try {
            const checkOutDate = new Date(
              validatedData.checkOut
            );
            if (!isNaN(checkOutDate.getTime())) {
              searchInput.checkOut =
                checkOutDate.toISOString();
            }
          } catch {
            console.warn(
              "Invalid checkOut date:",
              validatedData.checkOut
            );
          }
        }

        await searchProperties({
          variables: { searchInput },
        });

        return true;
      } catch (err) {
        if (err instanceof z.ZodError) {
          const errors: PropertySearchError = {};
          err.errors.forEach((error) => {
            const path = error
              .path[0] as keyof PropertySearchError;
            errors[path] = error.message;
          });
          setSearchErrors(errors);
        } else {
          setSearchErrors({
            general:
              "An unexpected error occurred during search",
          });
        }
        return false;
      }
    },
    [searchProperties]
  );

  const clearSearch = useCallback(() => {
    setSearchErrors({});
  }, []);

  return {
    searchProperties: validateAndSearch,
    clearSearch,
    properties: data?.searchProperties as
      | Property[]
      | undefined,
    loading,
    error: error?.message,
    searchErrors,
  };
};
