import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";

const getGraphQLUrl = () => {
  const url =
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:4000/graphql";
  return url;
};

const httpLink = createHttpLink({
  uri: getGraphQLUrl(),
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
  },
});

export const errorLink = onError(
  ({ graphQLErrors, networkError, operation }) => {
    console.log("=== GraphQL Operation Debug ===");
    console.log("Operation Name:", operation.operationName);
    console.log("Variables:", operation.variables);
    console.log("GraphQL URL:", getGraphQLUrl());

    if (graphQLErrors) {
      console.log("GraphQL Errors:");
      graphQLErrors.forEach(
        ({ message, locations, path }) => {
          console.error(
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
          );
        }
      );
    }

    if (networkError) {
      console.error("=== Network Error Details ===");
      console.error("Error:", networkError);
      console.error("Name:", networkError.name);
      console.error("Message:", networkError.message);

      if ("uri" in networkError) {
        console.error("Failed URL:", networkError.uri);
      }
    }
  }
);

export const apolloClient = new ApolloClient({
  link: from([errorLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-and-network",
      errorPolicy: "all",
    },
    query: {
      fetchPolicy: "network-only",
      errorPolicy: "all",
    },
    mutate: {
      errorPolicy: "all",
    },
  },
});
