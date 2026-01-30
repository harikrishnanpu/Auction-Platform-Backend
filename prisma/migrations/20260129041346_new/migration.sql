/*
  Warnings:

  - The values [LANDING] on the enum `KYCType` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO');

-- CreateEnum
CREATE TYPE "AuctionStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ENDED', 'SOLD', 'CANCELLED');

-- AlterEnum
BEGIN;
CREATE TYPE "KYCType_new" AS ENUM ('SELLER', 'MODERATOR');
ALTER TABLE "public"."KYCProfile" ALTER COLUMN "kyc_type" DROP DEFAULT;
ALTER TABLE "KYCProfile" ALTER COLUMN "kyc_type" TYPE "KYCType_new" USING ("kyc_type"::text::"KYCType_new");
ALTER TYPE "KYCType" RENAME TO "KYCType_old";
ALTER TYPE "KYCType_new" RENAME TO "KYCType";
DROP TYPE "public"."KYCType_old";
ALTER TABLE "KYCProfile" ALTER COLUMN "kyc_type" SET DEFAULT 'SELLER';
COMMIT;

-- CreateTable
CREATE TABLE "Auction" (
    "auction_id" TEXT NOT NULL,
    "seller_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "start_price" DOUBLE PRECISION NOT NULL,
    "min_increment" DOUBLE PRECISION NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "status" "AuctionStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Auction_pkey" PRIMARY KEY ("auction_id")
);

-- CreateTable
CREATE TABLE "AuctionMedia" (
    "id" TEXT NOT NULL,
    "auction_id" TEXT NOT NULL,
    "seller_id" TEXT NOT NULL,
    "type" "MediaType" NOT NULL,
    "url" TEXT NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuctionMedia_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Auction" ADD CONSTRAINT "Auction_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuctionMedia" ADD CONSTRAINT "AuctionMedia_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "Auction"("auction_id") ON DELETE RESTRICT ON UPDATE CASCADE;
