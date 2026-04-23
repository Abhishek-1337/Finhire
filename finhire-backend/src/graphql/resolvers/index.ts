import { randomUUID } from "crypto";
import type { GraphQLContext } from "../context";
import { comparePassword, hashPassword, signToken } from "../../utils/auth";
import { PrismaClient } from "@prisma/client";
import callOpenAI from "../../utils/openAi";
import filterExperts from "../../utils/filterExperts";

type AppUser = {
  id: string;
  name: string;
  email: string;
  role: "BUSINESS" | "EXPERT";
  location: string | null;
  createdAt: Date;
  
};

type ExpertTypeValue = "ACCOUNTANT" | "CFO" | "AR_REVENUE_SPECIALIST" | "OTHER";

const mapUser = (u: AppUser) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  location: u.location,
  createdAt: u.createdAt.toISOString(),
});

const requireAuth = (ctx: GraphQLContext) => {
  if (!ctx.auth) throw new Error("Unauthorized");
  return ctx.auth;
};

const getExpertProfileByUserId = async (ctx: GraphQLContext, userId: string) => {
  const expert = await ctx.db.user.findUnique({
    where: { id: userId },
    include: {
      expertProfile: true,
      reviewsGot: { select: { rating: true } },
    },
  });

  if (!expert || !expert.expertProfile) return null;
  const ratings = expert.reviewsGot.map((r:any) => r.rating);
  const reviewCount = ratings.length;
  const averageRating =
    reviewCount === 0 ? 0 : ratings.reduce((sum: string, rating: string) => sum + rating, 0) / reviewCount;

  return {
    user: mapUser(expert),
    title: expert.expertProfile.title,
    expertType: expert.expertProfile.expertType,
    yearsExperience: expert.expertProfile.yearsExperience,
    hourlyRate: expert.expertProfile.hourlyRate
      ? Number(expert.expertProfile.hourlyRate)
      : null,
    bio: expert.expertProfile.bio,
    averageRating,
    reviewCount,
  };
};

export const resolvers = {
  ExpertProfile: {
    reviews: async (parent: { user: { id: string } }, _: unknown, ctx: GraphQLContext) => {
      const reviews = await ctx.db.review.findMany({
        where: { expertUserId: parent.user.id },
        orderBy: { createdAt: "desc" },
        include: { businessUser: true },
        take: 20,
      });

      return reviews.map((r: any) => ({
        id: r.id,
        businessUserId: r.businessUserId,
        expertUserId: r.expertUserId,
        engagementId: r.engagementId,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt.toISOString(),
        businessUser: r.businessUser,
      }));
    },
  },

  Review: {
    businessUser: async (
      parent: { businessUserId: string; businessUser?: AppUser },
      _: unknown,
      ctx: GraphQLContext,
    ) => {
      if (parent.businessUser) return mapUser(parent.businessUser);
      const user = await ctx.db.user.findUnique({ where: { id: parent.businessUserId } });
      if (!user) throw new Error("User not found");
      return mapUser(user);
    },
  },

  QuoteRequest: {
    businessUser: async (
      parent: { businessUserId: string; businessUser?: AppUser },
      _: unknown,
      ctx: GraphQLContext,
    ) => {
      if (parent.businessUser) return mapUser(parent.businessUser);
      const user = await ctx.db.user.findUnique({ where: { id: parent.businessUserId } });
      if (!user) throw new Error("User not found");
      return mapUser(user);
    },
    expertUser: async (
      parent: { expertUserId: string; expertUser?: AppUser },
      _: unknown,
      ctx: GraphQLContext,
    ) => {
      if (parent.expertUser) return mapUser(parent.expertUser);
      const user = await ctx.db.user.findUnique({ where: { id: parent.expertUserId } });
      if (!user) throw new Error("User not found");
      return mapUser(user);
    },
  },

  Query: {
    me: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      const auth = requireAuth(ctx);
      const user = await ctx.db.user.findUnique({ where: { id: auth.userId } });
      return user ? mapUser(user) : null;
    },

    aiSearch: async (_: unknown, { query }: { query: string }, ctx: GraphQLContext) => {
      const response = await callOpenAI(query);
      return filterExperts({ filters: response as any });
    },

    expertProfile: async (_: unknown, { userId }: { userId: string }, ctx: GraphQLContext) => {
      return getExpertProfileByUserId(ctx, userId);
    },

    searchExperts: async (
      _: unknown,
      {
        filters,
      }: {
        filters?: {
          location?: string;
          expertType?: ExpertTypeValue;
          minRating?: number;
          minYearsExperience?: number;
        };
      },
      ctx: GraphQLContext,
    ) => {
      
      return filterExperts({ filters });
    },

    quotesForMe: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      const auth = requireAuth(ctx);
      const quotes = await ctx.db.quoteRequest.findMany({
        where:
          auth.role === "BUSINESS"
            ? { businessUserId: auth.userId }
            : { expertUserId: auth.userId },
        orderBy: { createdAt: "desc" },
        include: { proposal: true, businessUser: true, expertUser: true },
      });

      return quotes.map((q: any) => ({
        id: q.id,
        businessUserId: q.businessUserId,
        expertUserId: q.expertUserId,
        businessUser: q.businessUser,
        expertUser: q.expertUser,
        projectDetails: q.projectDetails,
        budget: q.budget ? Number(q.budget) : null,
        timeline: q.timeline,
        status: q.status,
        createdAt: q.createdAt.toISOString(),
        proposal: q.proposal ? {
          id: q.proposal.id,
          quoteRequestId: q.proposal.quoteRequestId,
          expertUserId: q.proposal.expertUserId,
          price: Number(q.proposal.price),
          timeline: q.proposal.timeline,
          message: q.proposal.message,
          createdAt: q.proposal.createdAt.toISOString(),
        } : null,
      }));
    },

    proposalsForMe: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      const auth = requireAuth(ctx);
      if (auth.role !== "EXPERT") throw new Error("Only experts can view proposals");

      const proposals = await ctx.db.proposal.findMany({
        where: { expertUserId: auth.userId },
        orderBy: { createdAt: "desc" },
      });

      return proposals.map((p: any) => ({
        id: p.id,
        quoteRequestId: p.quoteRequestId,
        expertUserId: p.expertUserId,
        price: Number(p.price),
        timeline: p.timeline,
        message: p.message,
        createdAt: p.createdAt.toISOString(),
      }));
    },

    engagementsForMe: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      const auth = requireAuth(ctx);
      const engagements = await ctx.db.engagement.findMany({
        where:
          auth.role === "BUSINESS"
            ? { businessUserId: auth.userId }
            : { expertUserId: auth.userId },
        orderBy: { startedAt: "desc" },
        include: { review: true, expertUser: true },
      });

      return engagements.map((e: any) => ({
        id: e.id,
        businessUserId: e.businessUserId ,
        expertUserId: e.expertUserId,
        proposalId: e.proposalId,
        status: e.status,
        startedAt: e.startedAt.toISOString(),
        expertUser: e.expertUser ? {  
          id: e.expertUser.id,  
          name: e.expertUser.name,
        }: null,
        completedAt: e.completedAt?.toISOString() || null,
        review: e.review ? {
          id: e.review.id,
          businessUserId: e.review.businessUserId,
          expertUserId: e.review.expertUserId,
          engagementId: e.review.engagementId,
          rating: e.review.rating,
          comment: e.review.comment,
          createdAt: e.review.createdAt.toISOString(),
        } : null,
      }));
    },

    favoritesForMe: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      const auth = requireAuth(ctx);
      if (auth.role !== "BUSINESS") throw new Error("Only businesses can view favorites");

      const favorites = await ctx.db.favorite.findMany({
        where: { businessUserId: auth.userId },
        orderBy: { createdAt: "desc" },
      });

      return favorites.map((f: any) => ({
        id: f.id,
        businessUserId: f.businessUserId,
        expertUserId: f.expertUserId,
        createdAt: f.createdAt.toISOString(),
      }));
    },

    notificationsForMe: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      const auth = requireAuth(ctx);
      const notifications = await ctx.db.notification.findMany({
        where: { userId: auth.userId },
        orderBy: { createdAt: "desc" },
      });

      return notifications.map((n: any) => ({
        id: n.id,
        userId: n.userId,
        type: n.type,
        message: n.message,
        isRead: n.isRead,
        createdAt: n.createdAt.toISOString(),
      }));
    },
  },

  Mutation: {
    register: async (
      _: unknown,
      {
        input,
      }: {
        input: {
          name: string;
          email: string;
          password: string;
          role: "BUSINESS" | "EXPERT";
          location?: string;
        };
      },
      ctx: GraphQLContext,
    ) => {
      const passwordHash = await hashPassword(input.password);
      const user = await ctx.db.user.create({
        data: {
          id: randomUUID(),
          name: input.name,
          email: input.email.toLowerCase(),
          passwordHash,
          role: input.role,
          location: input.location ?? null,
        },
      });

      return { token: signToken({ userId: user.id, role: user.role }), user: mapUser(user) };
    },

    login: async (
      _: unknown,
      { input }: { input: { email: string; password: string } },
      ctx: GraphQLContext,
    ) => {
      const user = await ctx.db.user.findUnique({
        where: { email: input.email.toLowerCase() },
      });
    
      if (!user) throw new Error("Invalid credentials");
    
      const valid = await comparePassword(input.password, user.passwordHash);
      if (!valid) throw new Error("Invalid credentials");
    
      return {
        token: signToken({ userId: user.id, role: user.role }),
        user: mapUser(user),
      };
    },

    upsertExpertProfile: async (
      _: unknown,
      {
        input,
      }: {
        input: {
          title: string;
          expertType: ExpertTypeValue;
          yearsExperience: number;
          hourlyRate?: number;
          bio: string;
        };
      },
      ctx: GraphQLContext,
    ) => {
      const auth = requireAuth(ctx);
      if (auth.role !== "EXPERT") throw new Error("Only experts can create profiles");

      await ctx.db.expertProfile.upsert({
        where: { userId: auth.userId },
        create: {
          userId: auth.userId,
          title: input.title,
          expertType: input.expertType,
          yearsExperience: input.yearsExperience,
          hourlyRate: input.hourlyRate ?? null,
          bio: input.bio,
        },
        update: {
          title: input.title,
          expertType: input.expertType,
          yearsExperience: input.yearsExperience,
          hourlyRate: input.hourlyRate ?? null,
          bio: input.bio,
        },
      });

      return getExpertProfileByUserId(ctx, auth.userId);
    },

    requestQuote: async (
      _: unknown,
      {
        input,
      }: {
        input: { expertUserId: string; projectDetails: string; budget?: number; timeline?: string };
      },
      ctx: GraphQLContext,
    ) => {
      const auth = requireAuth(ctx);
      if (auth.role !== "BUSINESS") throw new Error("Only businesses can request quotes");

      const quote = await ctx.db.quoteRequest.create({
        data: {
          id: randomUUID(),
          businessUserId: auth.userId,
          expertUserId: input.expertUserId,
          projectDetails: input.projectDetails,
          budget: input.budget ?? null,
          timeline: input.timeline ?? null,
        },
      });
      const user = await ctx.db.user.findUnique({ where: { id: auth.userId } });
      if(!user) throw new Error("User not found");

      // Create notification for expert
      await ctx.db.notification.create({
        data: {
          id: randomUUID(),
          userId: input.expertUserId,
          type: "QUOTE_REQUEST_RECEIVED",
          message: `New quote request from ${user.name}`,
        },
      });

      return {
        id: quote.id,
        businessUserId: quote.businessUserId,
        expertUserId: quote.expertUserId,
        projectDetails: quote.projectDetails,
        budget: quote.budget ? Number(quote.budget) : null,
        timeline: quote.timeline,
        status: quote.status,
        createdAt: quote.createdAt.toISOString(),
        proposal: null,
      };
    },

    addReview: async (
      _: unknown,
      { input }: { input: { engagementId: string; rating: number; comment?: string } },
      ctx: GraphQLContext,
    ) => {
      const auth = requireAuth(ctx);
      if (auth.role !== "BUSINESS") throw new Error("Only businesses can review experts");

      // Check if engagement exists and belongs to user and is completed
      const engagement = await ctx.db.engagement.findUnique({
        where: { id: input.engagementId },
        include: { review: true },
      });
      if (!engagement || engagement.businessUserId !== auth.userId || engagement.status !== "COMPLETED") {
        throw new Error("Invalid engagement for review");
      }
      if (engagement.review) {
        throw new Error("Review already exists for this engagement");
      }

      const review = await ctx.db.review.create({
        data: {
          id: randomUUID(),
          businessUserId: auth.userId,
          expertUserId: engagement.expertUserId,
          engagementId: input.engagementId,
          rating: input.rating,
          comment: input.comment ?? null,
        },
      });

       const user = await ctx.db.user.findUnique({ where: { id: auth.userId } });
      if(!user) throw new Error("User not found");

      // Create notification for expert
      await ctx.db.notification.create({
        data: {
          id: randomUUID(),
          userId: engagement.expertUserId,
          type: "NEW_REVIEW",
          message: `New review from ${user.name}`,
        },
      });

      return {
        id: review.id,
        businessUserId: review.businessUserId,
        expertUserId: review.expertUserId,
        engagementId: review.engagementId,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt.toISOString(),
      };
    },

    updateQuoteStatus: async (
      _: unknown,
      {
        quoteRequestId,
        status,
      }: { quoteRequestId: string; status: "PENDING" | "ACCEPTED" | "DECLINED" },
      ctx: GraphQLContext,
    ) => {
      const auth = requireAuth(ctx);
      if (auth.role !== "EXPERT") throw new Error("Only experts can update quote status");

      const existing = await ctx.db.quoteRequest.findUnique({
        where: { id: quoteRequestId },
      });
      if (!existing || existing.expertUserId !== auth.userId) {
        throw new Error("Quote request not found");
      }

      const quote = await ctx.db.quoteRequest.update({
        where: { id: quoteRequestId },
        data: { status },
      });

       const user = await ctx.db.user.findUnique({ where: { id: auth.userId } });
      if(!user) throw new Error("User not found");

      // Create notification for business
      const notificationType = status === "ACCEPTED" ? "QUOTE_ACCEPTED" : status === "DECLINED" ? "QUOTE_DECLINED" : "QUOTE_REQUEST_RECEIVED";
      await ctx.db.notification.create({
        data: {
          id: randomUUID(),
          userId: existing.businessUserId,
          type: notificationType,
          message: `Quote request ${status.toLowerCase()} by ${user.name}`,
        },
      });

      return {
        id: quote.id,
        businessUserId: quote.businessUserId,
        expertUserId: quote.expertUserId,
        projectDetails: quote.projectDetails,
        budget: quote.budget ? Number(quote.budget) : null,
        timeline: quote.timeline,
        status: quote.status,
        createdAt: quote.createdAt.toISOString(),
        proposal: null,
      };
    },

    submitProposal: async (
      _: unknown,
      { input }: { input: { quoteRequestId: string; price: number; timeline: string; message?: string } },
      ctx: GraphQLContext,
    ) => {
      const auth = requireAuth(ctx);
      if (auth.role !== "EXPERT") throw new Error("Only experts can submit proposals");

      const quoteRequest = await ctx.db.quoteRequest.findUnique({
        where: { id: input.quoteRequestId },
        include: { proposal: true },
      });
      if (!quoteRequest || quoteRequest.expertUserId !== auth.userId) {
        throw new Error("Quote request not found");
      }
      if (quoteRequest.proposal) {
        throw new Error("Proposal already submitted for this quote request");
      }

      const proposal = await ctx.db.proposal.create({
        data: {
          id: randomUUID(),
          quoteRequestId: input.quoteRequestId,
          expertUserId: auth.userId,
          price: input.price,
          timeline: input.timeline,
          message: input.message ?? null,
        },
      });

      return {
        id: proposal.id,
        quoteRequestId: proposal.quoteRequestId,
        expertUserId: proposal.expertUserId,
        price: Number(proposal.price),
        timeline: proposal.timeline,
        message: proposal.message,
        createdAt: proposal.createdAt.toISOString(),
      };
    },

    startEngagement: async (
      _: unknown,
      { input }: { input: { proposalId: string } },
      ctx: GraphQLContext,
    ) => {
      const auth = requireAuth(ctx);
      if (auth.role !== "BUSINESS") throw new Error("Only businesses can start engagements");

      const proposal = await ctx.db.proposal.findUnique({
        where: { id: input.proposalId },
        include: { quoteRequest: true },
      });
      if (!proposal || proposal.quoteRequest.businessUserId !== auth.userId) {
        throw new Error("Proposal not found");
      }

      const engagement = await ctx.db.engagement.create({
        data: {
          id: randomUUID(),
          businessUserId: auth.userId,
          expertUserId: proposal.expertUserId,
          proposalId: input.proposalId,
        },
      });

       const user = await ctx.db.user.findUnique({ where: { id: auth.userId } });
      if(!user) throw new Error("User not found");

      // Create notification for expert
      await ctx.db.notification.create({
        data: {
          id: randomUUID(),
          userId: proposal.expertUserId,
          type: "ENGAGEMENT_STARTED",
          message: `New engagement started with ${user.name}`,
        },
      });

      return {
        id: engagement.id,
        businessUserId: engagement.businessUserId,
        expertUserId: engagement.expertUserId,
        proposalId: engagement.proposalId,
        status: engagement.status,
        startedAt: engagement.startedAt.toISOString(),
        completedAt: null,
        review: null,
      };
    },

    completeEngagement: async (
      _: unknown,
      { engagementId }: { engagementId: string },
      ctx: GraphQLContext,
    ) => {
      const auth = requireAuth(ctx);
      if (auth.role !== "BUSINESS") throw new Error("Only businesses can complete engagements");

      const engagement = await ctx.db.engagement.findUnique({
        where: { id: engagementId },
      });
      if (!engagement || engagement.businessUserId !== auth.userId) {
        throw new Error("Engagement not found");
      }

      const updated = await ctx.db.engagement.update({
        where: { id: engagementId },
        data: { status: "COMPLETED", completedAt: new Date() },
      });

      const user = await ctx.db.user.findUnique({ where: { id: auth.userId } });
      if(!user) throw new Error("User not found");

      // Create notification for expert
      await ctx.db.notification.create({
        data: {
          id: randomUUID(),
          userId: engagement.expertUserId,
          type: "ENGAGEMENT_COMPLETED",
          message: `Engagement completed by ${user.name}`,
        },
      });

      return {
        id: updated.id,
        businessUserId: updated.businessUserId,
        expertUserId: updated.expertUserId,
        proposalId: updated.proposalId,
        status: updated.status,
        startedAt: updated.startedAt.toISOString(),
        completedAt: updated.completedAt?.toISOString() || null,
        review: null,
      };
    },

    toggleFavorite: async (
      _: unknown,
      { input }: { input: { expertUserId: string } },
      ctx: GraphQLContext,
    ) => {
      const auth = requireAuth(ctx);
      if (auth.role !== "BUSINESS") throw new Error("Only businesses can manage favorites");

      const existing = await ctx.db.favorite.findUnique({
        where: {
          businessUserId_expertUserId: {
            businessUserId: auth.userId,
            expertUserId: input.expertUserId,
          },
        },
      });

      if (existing) {
        await ctx.db.favorite.delete({
          where: { id: existing.id },
        });
        return null;
      } else {
        const favorite = await ctx.db.favorite.create({
          data: {
            id: randomUUID(),
            businessUserId: auth.userId,
            expertUserId: input.expertUserId,
          },
        });
        return {
          id: favorite.id,
          businessUserId: favorite.businessUserId,
          expertUserId: favorite.expertUserId,
          createdAt: favorite.createdAt.toISOString(),
        };
      }
    },

    markNotificationRead: async (
      _: unknown,
      { notificationId }: { notificationId: string },
      ctx: GraphQLContext,
    ) => {
      const auth = requireAuth(ctx);
      const notification = await ctx.db.notification.findUnique({
        where: { id: notificationId },
      });
      if (!notification || notification.userId !== auth.userId) {
        throw new Error("Notification not found");
      }

      const updated = await ctx.db.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
      });

      return {
        id: updated.id,
        userId: updated.userId,
        type: updated.type,
        message: updated.message,
        isRead: updated.isRead,
        createdAt: updated.createdAt.toISOString(),
      };
    },
  },
};
