import { gql } from "apollo-server";

export const typeDefs = gql`
  enum UserRole {
    BUSINESS
    EXPERT
  }

  enum ExpertType {
    ACCOUNTANT
    CFO
    AR_REVENUE_SPECIALIST
    OTHER
  }

  enum QuoteStatus {
    PENDING
    ACCEPTED
    DECLINED
  }

  enum EngagementStatus {
    ACTIVE
    COMPLETED
    CANCELLED
  }

  enum NotificationType {
    QUOTE_REQUEST_RECEIVED
    QUOTE_ACCEPTED
    QUOTE_DECLINED
    ENGAGEMENT_STARTED
    ENGAGEMENT_COMPLETED
    NEW_REVIEW
  }

  type User {
    id: ID!
    name: String!
    email: String!
    role: UserRole!
    location: String
    createdAt: String!
  }

  type ExpertProfile {
    user: User!
    title: String!
    expertType: ExpertType!
    yearsExperience: Int!
    hourlyRate: Float
    bio: String!
    averageRating: Float!
    reviewCount: Int!
  }

  type Review {
    id: ID!
    businessUserId: ID!
    expertUserId: ID!
    engagementId: ID!
    rating: Int!
    comment: String
    createdAt: String!
  }

  type QuoteRequest {
    id: ID!
    businessUserId: ID!
    expertUserId: ID!
    projectDetails: String!
    budget: Float
    timeline: String
    status: QuoteStatus!
    createdAt: String!
    proposal: Proposal
  }

  type Proposal {
    id: ID!
    quoteRequestId: ID!
    expertUserId: ID!
    price: Float!
    timeline: String!
    message: String
    createdAt: String!
  }

  type Engagement {
    id: ID!
    businessUserId: ID!
    expertUserId: ID!
    proposalId: ID!
    status: EngagementStatus!
    startedAt: String!
    completedAt: String
    review: Review
  }

  type Favorite {
    id: ID!
    businessUserId: ID!
    expertUserId: ID!
    createdAt: String!
  }

  type Notification {
    id: ID!
    userId: ID!
    type: NotificationType!
    message: String!
    isRead: Boolean!
    createdAt: String!
  }

  type AuthResponse {
    token: String!
    user: User!
  }

  input RegisterInput {
    name: String!
    email: String!
    password: String!
    role: UserRole!
    location: String
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input ExpertProfileInput {
    title: String!
    expertType: ExpertType!
    yearsExperience: Int!
    hourlyRate: Float
    bio: String!
  }

  input SearchExpertsInput {
    location: String
    expertType: ExpertType
    minRating: Float
    minYearsExperience: Int
  }

  input QuoteRequestInput {
    expertUserId: ID!
    projectDetails: String!
    budget: Float
    timeline: String
  }

  input ProposalInput {
    quoteRequestId: ID!
    price: Float!
    timeline: String!
    message: String
  }

  input EngagementInput {
    proposalId: ID!
  }

  input ReviewInput {
    engagementId: ID!
    rating: Int!
    comment: String
  }

  input FavoriteInput {
    expertUserId: ID!
  }

  type Query {
    me: User
    expertProfile(userId: ID!): ExpertProfile
    searchExperts(filters: SearchExpertsInput): [ExpertProfile!]!
    quotesForMe: [QuoteRequest!]!
    proposalsForMe: [Proposal!]!
    engagementsForMe: [Engagement!]!
    favoritesForMe: [Favorite!]!
    notificationsForMe: [Notification!]!
  }

  type Mutation {
    register(input: RegisterInput!): AuthResponse!
    login(input: LoginInput!): AuthResponse!
    upsertExpertProfile(input: ExpertProfileInput!): ExpertProfile!
    requestQuote(input: QuoteRequestInput!): QuoteRequest!
    submitProposal(input: ProposalInput!): Proposal!
    startEngagement(input: EngagementInput!): Engagement!
    completeEngagement(engagementId: ID!): Engagement!
    addReview(input: ReviewInput!): Review!
    updateQuoteStatus(quoteRequestId: ID!, status: QuoteStatus!): QuoteRequest!
    toggleFavorite(input: FavoriteInput!): Favorite
    markNotificationRead(notificationId: ID!): Notification!
  }
`;
