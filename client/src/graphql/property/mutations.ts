import { gql } from "@apollo/client";

export const CREATE_PROPERTY_MUTATION = gql`
  mutation CreateProperty(
    $createPropertyInput: CreatePropertyInput!
  ) {
    createProperty(
      createPropertyInput: $createPropertyInput
    ) {
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
      user {
        id
        name
        email
      }
    }
  }
`;
