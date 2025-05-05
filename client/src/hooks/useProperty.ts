"use client";

import { useQuery, useMutation } from "@apollo/client";
import {
  GET_MY_PROPERTIES_QUERY,
  GET_PROPERTIES_QUERY,
  GET_PROPERTY_QUERY,
  DELETE_PROPERTY_MUTATION,
} from "@/graphql/property";
import { PropertyFilterData } from "@/types/property";

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
      // Remove the deleted property from the cache
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
