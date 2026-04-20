import { gql } from "@apollo/client/core";

export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        name
        email
        role
      }
    }
  }
`;

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        name
        email
        role
      }
    }
  }
`;

export const SEARCH_EXPERTS = gql`
  query SearchExperts($filters: SearchExpertsInput) {
    searchExperts(filters: $filters) {
      user {
        id
        name
        location
      }
      title
      expertType
      yearsExperience
      hourlyRate
      bio
      averageRating
      reviewCount
    }
  }
`;

export const ME = gql`
  query Me {
    me {
      id
      role
      name
      email
      location
    }
  }
`;

export const EXPERT_PROFILE = gql`
  query ExpertProfile($userId: ID!) {
    expertProfile(userId: $userId) {
      user {
        id
        name
        email
        role
        location
      }
      title
      expertType
      yearsExperience
      hourlyRate
      bio
      averageRating
      reviewCount
    }
  }
`;

export const UPSERT_EXPERT_PROFILE = gql`
  mutation UpsertExpertProfile($input: ExpertProfileInput!) {
    upsertExpertProfile(input: $input) {
      user {
        id
        name
      }
      title
      expertType
      yearsExperience
      hourlyRate
      bio
    }
  }
`;

export const REQUEST_QUOTE = gql`
  mutation RequestQuote($input: QuoteRequestInput!) {
    requestQuote(input: $input) {
      id
      status
      expertUserId
      projectDetails
      budget
      timeline
    }
  }
`;

export const UPDATE_QUOTE_STATUS = gql`
  mutation UpdateQuoteStatus($quoteRequestId: ID!, $status: QuoteStatus!) {
    updateQuoteStatus(quoteRequestId: $quoteRequestId, status: $status) {
      id
      status
      expertUserId
      businessUserId
      projectDetails
      budget
    }
  }
`;

export const ADD_REVIEW = gql`
  mutation AddReview($input: ReviewInput!) {
    addReview(input: $input) {
      id
      expertUserId
      rating
      comment
    }
  }
`;


export const QUOTES_FOR_ME = gql`
  query QuotesForMe {
    quotesForMe {
      id
      businessUserId
      expertUserId
      projectDetails
      budget
      timeline
      status
      createdAt
      proposal {
        id
        price
        timeline
        message
        createdAt
      }
    }
  }
`;

export const PROPOSALS_FOR_ME = gql`
  query ProposalsForMe {
    proposalsForMe {
      id
      quoteRequestId
      expertUserId
      price
      timeline
      message
      createdAt
    }
  }
`;

export const ENGAGEMENTS_FOR_ME = gql`
  query EngagementsForMe {
    engagementsForMe {
      id
      businessUserId
      expertUserId
      proposalId
      status
      startedAt
      completedAt
      review {
        id
        rating
        comment
        createdAt
      }
    }
  }
`;

export const FAVORITES_FOR_ME = gql`
  query FavoritesForMe {
    favoritesForMe {
      id
      expertUserId
      createdAt
    }
  }
`;

export const NOTIFICATIONS_FOR_ME = gql`
  query NotificationsForMe {
    notificationsForMe {
      id
      type
      message
      isRead
      createdAt
    }
  }
`;

export const SUBMIT_PROPOSAL = gql`
  mutation SubmitProposal($input: ProposalInput!) {
    submitProposal(input: $input) {
      id
      quoteRequestId
      price
      timeline
      message
    }
  }
`;

export const START_ENGAGEMENT = gql`
  mutation StartEngagement($input: EngagementInput!) {
    startEngagement(input: $input) {
      id
      status
      startedAt
    }
  }
`;

export const COMPLETE_ENGAGEMENT = gql`
  mutation CompleteEngagement($engagementId: ID!) {
    completeEngagement(engagementId: $engagementId) {
      id
      status
      completedAt
    }
  }
`;


export const TOGGLE_FAVORITE = gql`
  mutation ToggleFavorite($input: FavoriteInput!) {
    toggleFavorite(input: $input) {
      id
      expertUserId
    }
  }
`;

export const MARK_NOTIFICATION_READ = gql`
  mutation MarkNotificationRead($notificationId: ID!) {
    markNotificationRead(notificationId: $notificationId) {
      id
      isRead
    }
  }
`;
