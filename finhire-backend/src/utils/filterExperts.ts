import { PrismaClient } from "@prisma/client";

const prismaClient = new PrismaClient();

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

async function filterExperts( {
        filters,
      }: {
        filters?: {
          location?: string;
          expertType?: ExpertTypeValue;
          rating?: number;
          experience?: number;
    }}) {
        console.log("filter",filters);
    const users = await prismaClient.user.findMany({
            where: {
              role: "EXPERT",
              ...(filters?.location
                ? { location: { contains: filters.location } }
                : {}),
              expertProfile: {
                ...(filters?.expertType ? { expertType: filters.expertType } : {}),
                ...(filters?.experience 
                  ? { yearsExperience: { gte: filters.experience } }
                  : {})
              },
            },
            include: {
              expertProfile: true,
              reviewsGot: { select: { rating: true } },
            },
          });
    
          const mapped = users
            .filter((u: any) => u.expertProfile)
            .map((u: any) => {
              const ratings = u.reviewsGot.map((r:any) => r.rating);
              const reviewCount = ratings.length;
              const averageRating =
                reviewCount === 0
                  ? 0
                  : ratings.reduce((sum: any, rating: any) => sum + rating, 0) / reviewCount;
    
              return {
                user: mapUser(u),
                title: u.expertProfile!.title,
                expertType: u.expertProfile!.expertType,
                yearsExperience: u.expertProfile!.yearsExperience,
                hourlyRate: u.expertProfile!.hourlyRate ? Number(u.expertProfile!.hourlyRate) : null,
                bio: u.expertProfile!.bio,
                averageRating,
                reviewCount,
              };
            })
            .filter((expert: any) =>
              filters?.rating !== undefined ? expert.averageRating >= filters.rating     : true,
            )
            .sort((a: any, b: any) => b.averageRating - a.averageRating || b.reviewCount - a.reviewCount);

            return mapped;
}

export default filterExperts;