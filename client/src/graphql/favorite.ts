import { gql } from "@apollo/client";

// Fragments
const FAVORITE_BASIC_FIELDS = gql`
  fragment FavoriteBasicFields on Favorite {
    id
    createdAt
    updatedAt
  }
`;

const FAVORITE_WITH_USER_FIELDS = gql`
  ${FAVORITE_BASIC_FIELDS}
  fragment FavoriteWithUserFields on Favorite {
    ...FavoriteBasicFields
    user {
      id
      name
      email
    }
  }
`;

const FAVORITE_WITH_PROPERTY_FIELDS = gql`
  ${FAVORITE_WITH_USER_FIELDS}
  fragment FavoriteWithPropertyFields on Favorite {
    ...FavoriteWithUserFields
    property {
      id
      name
      tagline
      category
      image
      price
      country
    }
  }
`;

// Queries
export const GET_MY_FAVORITES_QUERY = gql`
  ${FAVORITE_WITH_PROPERTY_FIELDS}
  query GetMyFavorites {
    myFavorites {
      ...FavoriteWithPropertyFields
    }
  }
`;

export const GET_FAVORITE_QUERY = gql`
  ${FAVORITE_WITH_PROPERTY_FIELDS}
  query GetFavorite($id: ID!) {
    favorite(id: $id) {
      ...FavoriteWithPropertyFields
    }
  }
`;

export const CHECK_FAVORITE_STATUS_QUERY = gql`
  query CheckFavoriteStatus($propertyId: ID!) {
    checkFavoriteStatus(propertyId: $propertyId) {
      isFavorite
      favoriteId
    }
  }
`;

// Mutations
export const TOGGLE_FAVORITE_MUTATION = gql`
  ${FAVORITE_WITH_PROPERTY_FIELDS}
  mutation ToggleFavorite($propertyId: ID!) {
    toggleFavorite(propertyId: $propertyId) {
      ...FavoriteWithPropertyFields
    }
  }
`;

export const DELETE_FAVORITE_MUTATION = gql`
  ${FAVORITE_WITH_PROPERTY_FIELDS}
  mutation DeleteFavorite($id: ID!) {
    deleteFavorite(id: $id) {
      ...FavoriteWithPropertyFields
    }
  }
`;
