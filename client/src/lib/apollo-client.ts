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
});

export const errorLink = onError(
  ({
    graphQLErrors,
    networkError,
    operation,
    response,
  }) => {
    console.log("=== GraphQL Operation Debug ===");
    console.log("Operation Name:", operation.operationName);
    console.log("Variables:", operation.variables);
    console.log("GraphQL URL:", getGraphQLUrl());

    console.log("Response:", response);

    if (graphQLErrors) {
      console.log("GraphQL Errors:");
      graphQLErrors.forEach(
        ({ message, locations, path, extensions }) => {
          console.error(
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
          );
          if (extensions) {
            console.error("Extensions:", extensions);
          }
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
      if ("statusCode" in networkError) {
        console.error(
          "Status Code:",
          networkError.statusCode
        );
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
      fetchPolicy: "cache-first",
      errorPolicy: "all",
    },
    mutate: {
      errorPolicy: "all",
    },
  },
});
