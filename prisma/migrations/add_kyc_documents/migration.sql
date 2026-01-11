-- Add document URLs to KYCProfile
ALTER TABLE "KYCProfile" ADD COLUMN IF NOT EXISTS "id_front_url" TEXT;
ALTER TABLE "KYCProfile" ADD COLUMN IF NOT EXISTS "id_back_url" TEXT;
ALTER TABLE "KYCProfile" ADD COLUMN IF NOT EXISTS "address_proof_url" TEXT;
