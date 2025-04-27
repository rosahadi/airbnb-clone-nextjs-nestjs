import { gql } from "@apollo/client";

export const SIGNUP_MUTATION = gql`
  mutation Signup($signupInput: SignupInput!) {
    signup(signupInput: $signupInput) {
      message
    }
  }
`;

export const VERIFY_EMAIL_MUTATION = gql`
  mutation VerifyEmail($token: String!) {
    verifyEmail(token: $token) {
      user {
        id
        name
        email
        roles
      }
    }
  }
`;

export const LOGIN_MUTATION = gql`
  mutation Login($loginInput: LoginInput!) {
    login(loginInput: $loginInput) {
      user {
        id
        name
        email
        roles
      }
    }
  }
`;

export const FORGOT_PASSWORD_MUTATION = gql`
  mutation ForgotPassword(
    $forgotPasswordInput: ForgotPasswordInput!
  ) {
    forgotPassword(
      forgotPasswordInput: $forgotPasswordInput
    )
  }
`;

export const RESET_PASSWORD_MUTATION = gql`
  mutation ResetPassword(
    $resetPasswordInput: ResetPasswordInput!
  ) {
    resetPassword(resetPasswordInput: $resetPasswordInput) {
      user {
        id
        name
        email
        roles
      }
    }
  }
`;

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;

export const UPDATE_PASSWORD_MUTATION = gql`
  mutation UpdatePassword(
    $updatePasswordInput: UpdatePasswordInput!
  ) {
    updatePassword(
      updatePasswordInput: $updatePasswordInput
    ) {
      user {
        id
        name
        email
        profileImage
      }
    }
  }
`;
