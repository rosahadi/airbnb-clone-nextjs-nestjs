import { gql } from "@apollo/client";

const PROPERTY_BASIC_FIELDS = gql`
  fragment PropertyBasicFields on Property {
    id
    name
    tagline
    category
    image
    country
    description
    price
    guests
    bedrooms
    beds
    baths
    amenities
    createdAt
    updatedAt
  }
`;

const PROPERTY_WITH_USER_FIELDS = gql`
  ${PROPERTY_BASIC_FIELDS}
  fragment PropertyWithUserFields on Property {
    ...PropertyBasicFields
    user {
      id
      name
      email
    }
  }
`;

const PROPERTY_WITH_RELATIONS_FIELDS = gql`
  ${PROPERTY_WITH_USER_FIELDS}
  fragment PropertyWithRelationsFields on Property {
    ...PropertyWithUserFields
    favorites {
      id
      user {
        id
        name
        email
      }
    }
    reviews {
      id
      rating
      comment
    }
    bookings {
      id
      checkIn
      checkOut
    }
  }
`;

// Queries
export const GET_PROPERTIES_QUERY = gql`
  ${PROPERTY_BASIC_FIELDS}
  query GetProperties($filters: PropertyFilterInput) {
    properties(filters: $filters) {
      ...PropertyBasicFields
    }
  }
`;

export const GET_PROPERTY_QUERY = gql`
  ${PROPERTY_WITH_RELATIONS_FIELDS}
  query property($id: ID!) {
    property(id: $id) {
      ...PropertyWithRelationsFields
    }
  }
`;

export const GET_MY_PROPERTIES_QUERY = gql`
  ${PROPERTY_WITH_USER_FIELDS}
  query GetMyProperties {
    myProperties {
      ...PropertyWithUserFields
    }
  }
`;

// Mutations
export const CREATE_PROPERTY_MUTATION = gql`
  ${PROPERTY_WITH_USER_FIELDS}
  mutation CreateProperty(
    $createPropertyInput: CreatePropertyInput!
  ) {
    createProperty(
      createPropertyInput: $createPropertyInput
    ) {
      ...PropertyWithUserFields
    }
  }
`;

export const UPDATE_PROPERTY_MUTATION = gql`
  ${PROPERTY_WITH_USER_FIELDS}
  mutation UpdateProperty(
    $id: ID!
    $updatePropertyInput: UpdatePropertyInput!
  ) {
    updateProperty(
      id: $id
      updatePropertyInput: $updatePropertyInput
    ) {
      ...PropertyWithUserFields
    }
  }
`;

export const DELETE_PROPERTY_MUTATION = gql`
  ${PROPERTY_BASIC_FIELDS}
  mutation DeleteProperty($id: ID!) {
    deleteProperty(id: $id) {
      ...PropertyBasicFields
    }
  }
`;
