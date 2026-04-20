/*
  Warnings:

  - A unique constraint covering the columns `[engagement_id]` on the table `reviews` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `engagement_id` to the `reviews` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EngagementStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('QUOTE_REQUEST_RECEIVED', 'QUOTE_ACCEPTED', 'QUOTE_DECLINED', 'ENGAGEMENT_STARTED', 'ENGAGEMENT_COMPLETED', 'NEW_REVIEW');

-- AlterTable
ALTER TABLE "quote_requests" ADD COLUMN     "timeline" TEXT;

-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "engagement_id" UUID NOT NULL;

-- CreateTable
CREATE TABLE "proposals" (
    "id" UUID NOT NULL,
    "quote_request_id" UUID NOT NULL,
    "expert_user_id" UUID NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "timeline" TEXT NOT NULL,
    "message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "engagements" (
    "id" UUID NOT NULL,
    "business_user_id" UUID NOT NULL,
    "expert_user_id" UUID NOT NULL,
    "proposal_id" UUID NOT NULL,
    "status" "EngagementStatus" NOT NULL DEFAULT 'ACTIVE',
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "engagements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorites" (
    "id" UUID NOT NULL,
    "business_user_id" UUID NOT NULL,
    "expert_user_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" "NotificationType" NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "proposals_quote_request_id_key" ON "proposals"("quote_request_id");

-- CreateIndex
CREATE UNIQUE INDEX "engagements_proposal_id_key" ON "engagements"("proposal_id");

-- CreateIndex
CREATE UNIQUE INDEX "favorites_business_user_id_expert_user_id_key" ON "favorites"("business_user_id", "expert_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_engagement_id_key" ON "reviews"("engagement_id");

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_engagement_id_fkey" FOREIGN KEY ("engagement_id") REFERENCES "engagements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_quote_request_id_fkey" FOREIGN KEY ("quote_request_id") REFERENCES "quote_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_expert_user_id_fkey" FOREIGN KEY ("expert_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engagements" ADD CONSTRAINT "engagements_business_user_id_fkey" FOREIGN KEY ("business_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engagements" ADD CONSTRAINT "engagements_expert_user_id_fkey" FOREIGN KEY ("expert_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engagements" ADD CONSTRAINT "engagements_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_business_user_id_fkey" FOREIGN KEY ("business_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_expert_user_id_fkey" FOREIGN KEY ("expert_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
