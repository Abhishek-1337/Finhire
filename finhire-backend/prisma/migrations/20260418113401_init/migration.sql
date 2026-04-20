-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('BUSINESS', 'EXPERT');

-- CreateEnum
CREATE TYPE "ExpertType" AS ENUM ('ACCOUNTANT', 'CFO', 'AR_REVENUE_SPECIALIST', 'OTHER');

-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "location" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expert_profiles" (
    "user_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "expert_type" "ExpertType" NOT NULL,
    "years_experience" INTEGER NOT NULL DEFAULT 0,
    "hourly_rate" DECIMAL(10,2),
    "bio" TEXT NOT NULL,

    CONSTRAINT "expert_profiles_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" UUID NOT NULL,
    "business_user_id" UUID NOT NULL,
    "expert_user_id" UUID NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quote_requests" (
    "id" UUID NOT NULL,
    "business_user_id" UUID NOT NULL,
    "expert_user_id" UUID NOT NULL,
    "project_details" TEXT NOT NULL,
    "budget" DECIMAL(12,2),
    "status" "QuoteStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quote_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_business_user_id_expert_user_id_key" ON "reviews"("business_user_id", "expert_user_id");

-- AddForeignKey
ALTER TABLE "expert_profiles" ADD CONSTRAINT "expert_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_business_user_id_fkey" FOREIGN KEY ("business_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_expert_user_id_fkey" FOREIGN KEY ("expert_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_requests" ADD CONSTRAINT "quote_requests_business_user_id_fkey" FOREIGN KEY ("business_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_requests" ADD CONSTRAINT "quote_requests_expert_user_id_fkey" FOREIGN KEY ("expert_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
