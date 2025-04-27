import { gql } from "@apollo/client";

export const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateMe($updateMeInput: UpdateMeInput!) {
    updateMe(updateMeInput: $updateMeInput) {
      id
      name
      email
      profileImage
    }
  }
`;
