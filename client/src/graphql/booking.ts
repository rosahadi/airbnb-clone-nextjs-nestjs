import { gql } from "@apollo/client";

const BOOKING_BASIC_FIELDS = gql`
  fragment BookingBasicFields on Booking {
    id
    subTotal
    cleaning
    service
    tax
    orderTotal
    totalNights
    checkIn
    checkOut
    status
    paymentStatus
    stripeSessionId
    stripePaymentIntentId
    paymentCompletedAt
    expiresAt
    createdAt
    updatedAt
  }
`;

const BOOKING_WITH_PROPERTY_FIELDS = gql`
  ${BOOKING_BASIC_FIELDS}
  fragment BookingWithPropertyFields on Booking {
    ...BookingBasicFields
    property {
      id
      name
      tagline
      category
      image
      country
      price
      guests
      bedrooms
      beds
      baths
    }
  }
`;

const BOOKING_WITH_RELATIONS_FIELDS = gql`
  ${BOOKING_BASIC_FIELDS}
  fragment BookingWithRelationsFields on Booking {
    ...BookingBasicFields
    user {
      id
      name
      email
      profileImage
    }
    property {
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
    }
  }
`;

// Queries
export const GET_USER_BOOKINGS_QUERY = gql`
  ${BOOKING_WITH_PROPERTY_FIELDS}
  query GetMyBookings {
    myBookings {
      ...BookingWithPropertyFields
    }
  }
`;

export const GET_BOOKING_QUERY = gql`
  ${BOOKING_WITH_RELATIONS_FIELDS}
  query GetBooking($id: ID!) {
    booking(id: $id) {
      ...BookingWithRelationsFields
    }
  }
`;

export const GET_HOST_RESERVATIONS_QUERY = gql`
  ${BOOKING_WITH_RELATIONS_FIELDS}
  query GetHostReservations {
    hostReservations {
      ...BookingWithRelationsFields
    }
  }
`;

export const GET_HOST_RESERVATION_STATS_QUERY = gql`
  query GetHostReservationStats {
    hostReservationStats {
      properties
      nights
      amount
    }
  }
`;

export const GET_APP_STATS_QUERY = gql`
  query GetAppStats {
    appStats {
      usersCount
      propertiesCount
      bookingsCount
    }
  }
`;

export const GET_CHARTS_DATA_QUERY = gql`
  query GetChartsData {
    chartsData {
      date
      count
    }
  }
`;

export const CREATE_BOOKING_WITH_PAYMENT_MUTATION = gql`
  mutation CreateBookingWithPayment(
    $createBookingWithPaymentInput: CreateBookingWithPaymentInput!
  ) {
    createBookingWithPayment(
      createBookingWithPaymentInput: $createBookingWithPaymentInput
    ) {
      clientSecret
      sessionId
      bookingId
    }
  }
`;

export const CONFIRM_PAYMENT_MUTATION = gql`
  ${BOOKING_WITH_RELATIONS_FIELDS}
  mutation ConfirmPayment(
    $confirmPaymentInput: ConfirmPaymentInput!
  ) {
    confirmPayment(
      confirmPaymentInput: $confirmPaymentInput
    ) {
      ...BookingWithRelationsFields
    }
  }
`;

export const CANCEL_BOOKING_MUTATION = gql`
  ${BOOKING_WITH_RELATIONS_FIELDS}
  mutation CancelBooking($id: ID!) {
    cancelBooking(id: $id) {
      ...BookingWithRelationsFields
    }
  }
`;

export const HANDLE_STRIPE_WEBHOOK_MUTATION = gql`
  mutation HandleStripeWebhook(
    $webhookData: WebhookEventInput!
  ) {
    handleStripeWebhook(webhookData: $webhookData) {
      type
      bookingId
      sessionId
      paymentIntentId
      error
      timestamp
    }
  }
`;
