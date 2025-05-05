import { PropertyError } from "@/types/property";
import { ApolloError } from "@apollo/client";

export const formatGraphQLError = (
  error: ApolloError
): PropertyError => {
  const formattedError: PropertyError = {
    general: error.message,
  };

  if (error.graphQLErrors) {
    error.graphQLErrors.forEach((graphqlError) => {
      if (graphqlError.extensions?.validationErrors) {
        Object.entries(
          graphqlError.extensions.validationErrors
        ).forEach(([field, message]) => {
          formattedError[field as keyof PropertyError] =
            Array.isArray(message)
              ? message[0]
              : message.toString();
        });
      }
    });
  }

  return formattedError;
};

export const getChangedValues = <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends Record<string, any>
>(
  currentValues: T,
  originalValues: T
): Partial<T> => {
  const changedValues: Partial<T> = {};

  (Object.keys(currentValues) as Array<keyof T>).forEach(
    (key) => {
      if (key === "amenities") {
        const current = JSON.parse(
          currentValues[key] || "[]"
        );
        const original = JSON.parse(
          originalValues[key] || "[]"
        );
        if (
          JSON.stringify(current) !==
          JSON.stringify(original)
        ) {
          changedValues[key] = currentValues[key];
        }
      } else if (
        currentValues[key] !== originalValues[key]
      ) {
        changedValues[key] = currentValues[key];
      }
    }
  );

  return changedValues;
};
