-- CreateEnum
CREATE TYPE "KYCType" AS ENUM ('SELLER', 'LANDING');

-- AlterTable
ALTER TABLE "KYCProfile" ADD COLUMN     "kyc_type" "KYCType" NOT NULL DEFAULT 'SELLER';
