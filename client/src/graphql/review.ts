import { gql } from "@apollo/client";

const REVIEW_BASIC_FIELDS = gql`
  fragment ReviewBasicFields on Review {
    id
    rating
    comment
    createdAt
    updatedAt
  }
`;

const REVIEW_WITH_USER_FIELDS = gql`
  ${REVIEW_BASIC_FIELDS}
  fragment ReviewWithUserFields on Review {
    ...ReviewBasicFields
    user {
      id
      name
      email
      profileImage
    }
  }
`;

const REVIEW_WITH_RELATIONS_FIELDS = gql`
  ${REVIEW_WITH_USER_FIELDS}
  fragment ReviewWithRelationsFields on Review {
    ...ReviewWithUserFields
    property {
      id
      name
      image
    }
  }
`;

// Queries
export const GET_REVIEWS_QUERY = gql`
  ${REVIEW_WITH_USER_FIELDS}
  query GetReviews($filters: ReviewFilterInput) {
    reviews(filters: $filters) {
      ...ReviewWithUserFields
    }
  }
`;

export const GET_PROPERTY_REVIEWS_QUERY = gql`
  ${REVIEW_WITH_USER_FIELDS}
  query PropertyReviews($propertyId: ID!) {
    propertyReviews(propertyId: $propertyId) {
      ...ReviewWithUserFields
    }
  }
`;

export const GET_PROPERTY_RATING_QUERY = gql`
  query PropertyRating($propertyId: ID!) {
    propertyRating(propertyId: $propertyId) {
      rating
      count
    }
  }
`;

export const GET_MY_REVIEWS_QUERY = gql`
  ${REVIEW_WITH_RELATIONS_FIELDS}
  query MyReviews {
    myReviews {
      ...ReviewWithRelationsFields
    }
  }
`;

// Mutations
export const CREATE_REVIEW_MUTATION = gql`
  ${REVIEW_WITH_RELATIONS_FIELDS}
  mutation CreateReview(
    $createReviewInput: CreateReviewInput!
  ) {
    createReview(createReviewInput: $createReviewInput) {
      ...ReviewWithRelationsFields
    }
  }
`;

export const UPDATE_REVIEW_MUTATION = gql`
  ${REVIEW_WITH_RELATIONS_FIELDS}
  mutation UpdateReview(
    $id: ID!
    $updateReviewInput: UpdateReviewInput!
  ) {
    updateReview(
      id: $id
      updateReviewInput: $updateReviewInput
    ) {
      ...ReviewWithRelationsFields
    }
  }
`;

export const DELETE_REVIEW_MUTATION = gql`
  ${REVIEW_BASIC_FIELDS}
  mutation DeleteReview($id: ID!) {
    deleteReview(id: $id) {
      ...ReviewBasicFields
    }
  }
`;
