/*
  Warnings:

  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[phone]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'SELLER', 'MODERATOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "AuctionStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'PENDING_PAYMENT', 'FAILED_PAYMENT', 'FALLBACK_IN_PROGRESS', 'PUBLIC_FALLBACK', 'SOLD', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OtpPurpose" AS ENUM ('REGISTER', 'LOGIN', 'VERIFY_PHONE', 'VERIFY_EMAIL', 'RESET_PASSWORD');

-- CreateEnum
CREATE TYPE "OtpChannel" AS ENUM ('SMS', 'EMAIL');

-- CreateEnum
CREATE TYPE "OtpStatus" AS ENUM ('PENDING', 'VERIFIED', 'EXPIRED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "FlagSource" AS ENUM ('SYSTEM', 'MODERATOR', 'ADMIN');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ALTER COLUMN "phone" DROP NOT NULL,
ALTER COLUMN "address" DROP NOT NULL,
ALTER COLUMN "password_hash" DROP NOT NULL;

-- CreateTable
CREATE TABLE "UserRole" (
    "user_role_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("user_role_id")
);

-- CreateTable
CREATE TABLE "UserSession" (
    "session_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "device_info" TEXT,
    "ip_address" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSession_pkey" PRIMARY KEY ("session_id")
);

-- CreateTable
CREATE TABLE "OTPVerification" (
    "otp_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "otp_hash" TEXT NOT NULL,
    "purpose" "OtpPurpose" NOT NULL,
    "channel" "OtpChannel" NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "max_attempts" INTEGER NOT NULL DEFAULT 3,
    "status" "OtpStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OTPVerification_pkey" PRIMARY KEY ("otp_id")
);

-- CreateTable
CREATE TABLE "KYCProfile" (
    "kyc_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "document_type" TEXT NOT NULL,
    "document_number" TEXT NOT NULL,
    "address" TEXT,
    "verification_status" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KYCProfile_pkey" PRIMARY KEY ("kyc_id")
);

-- CreateTable
CREATE TABLE "Wallet" (
    "wallet_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "balance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "locked_balance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("wallet_id")
);

-- CreateTable
CREATE TABLE "WalletTransaction" (
    "transaction_id" TEXT NOT NULL,
    "wallet_id" TEXT NOT NULL,
    "auction_id" TEXT,
    "amount" DECIMAL(65,30) NOT NULL,
    "transaction_type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WalletTransaction_pkey" PRIMARY KEY ("transaction_id")
);

-- CreateTable
CREATE TABLE "Auction" (
    "auction_id" TEXT NOT NULL,
    "seller_id" TEXT NOT NULL,
    "auction_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "minimum_bid" DECIMAL(65,30) NOT NULL,
    "bid_increment" DECIMAL(65,30) NOT NULL,
    "deposit_percentage" DECIMAL(65,30) NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "status" "AuctionStatus" NOT NULL DEFAULT 'DRAFT',
    "platform_commission_pct" DECIMAL(65,30) NOT NULL,
    "moderator_commission_pct" DECIMAL(65,30) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Auction_pkey" PRIMARY KEY ("auction_id")
);

-- CreateTable
CREATE TABLE "AuctionMedia" (
    "media_id" TEXT NOT NULL,
    "auction_id" TEXT NOT NULL,
    "media_url" TEXT NOT NULL,
    "media_type" TEXT NOT NULL,

    CONSTRAINT "AuctionMedia_pkey" PRIMARY KEY ("media_id")
);

-- CreateTable
CREATE TABLE "AuctionModerator" (
    "auction_moderator_id" TEXT NOT NULL,
    "auction_id" TEXT NOT NULL,
    "moderator_id" TEXT NOT NULL,
    "assigned_by" TEXT NOT NULL,
    "conflict_checked" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL,

    CONSTRAINT "AuctionModerator_pkey" PRIMARY KEY ("auction_moderator_id")
);

-- CreateTable
CREATE TABLE "ModeratorAction" (
    "action_id" TEXT NOT NULL,
    "auction_id" TEXT NOT NULL,
    "moderator_id" TEXT NOT NULL,
    "action_type" TEXT NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModeratorAction_pkey" PRIMARY KEY ("action_id")
);

-- CreateTable
CREATE TABLE "AuctionRoom" (
    "room_id" TEXT NOT NULL,
    "auction_id" TEXT NOT NULL,
    "current_highest_bid" DECIMAL(65,30) NOT NULL,
    "last_bid_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuctionRoom_pkey" PRIMARY KEY ("room_id")
);

-- CreateTable
CREATE TABLE "Bid" (
    "bid_id" TEXT NOT NULL,
    "auction_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "bid_amount" DECIMAL(65,30) NOT NULL,
    "bid_source" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_valid" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Bid_pkey" PRIMARY KEY ("bid_id")
);

-- CreateTable
CREATE TABLE "LetterBidCommit" (
    "commit_id" TEXT NOT NULL,
    "auction_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "commit_hash" TEXT NOT NULL,
    "committed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LetterBidCommit_pkey" PRIMARY KEY ("commit_id")
);

-- CreateTable
CREATE TABLE "LetterBidReveal" (
    "reveal_id" TEXT NOT NULL,
    "commit_id" TEXT NOT NULL,
    "revealed_amount" DECIMAL(65,30) NOT NULL,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "revealed_amount_encrypted" TEXT NOT NULL,
    "revealed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LetterBidReveal_pkey" PRIMARY KEY ("reveal_id")
);

-- CreateTable
CREATE TABLE "SubscriptionPlan" (
    "plan_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "duration_days" INTEGER NOT NULL,

    CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("plan_id")
);

-- CreateTable
CREATE TABLE "UserSubscription" (
    "subscription_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSubscription_pkey" PRIMARY KEY ("subscription_id")
);

-- CreateTable
CREATE TABLE "AIAgentProfile" (
    "ai_agent_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "max_bid_limit" DECIMAL(65,30) NOT NULL,
    "risk_level" TEXT NOT NULL,
    "strategy_type" TEXT NOT NULL,

    CONSTRAINT "AIAgentProfile_pkey" PRIMARY KEY ("ai_agent_id")
);

-- CreateTable
CREATE TABLE "AutoBidRule" (
    "auto_bid_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "auction_id" TEXT NOT NULL,
    "max_bid" DECIMAL(65,30) NOT NULL,
    "increment" DECIMAL(65,30) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "AutoBidRule_pkey" PRIMARY KEY ("auto_bid_id")
);

-- CreateTable
CREATE TABLE "AuctionResult" (
    "result_id" TEXT NOT NULL,
    "auction_id" TEXT NOT NULL,
    "winner_id" TEXT NOT NULL,
    "winning_bid" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL,
    "payment_deadline" TIMESTAMP(3) NOT NULL,
    "closed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuctionResult_pkey" PRIMARY KEY ("result_id")
);

-- CreateTable
CREATE TABLE "AuctionDeposit" (
    "deposit_id" TEXT NOT NULL,
    "auction_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "AuctionDeposit_pkey" PRIMARY KEY ("deposit_id")
);

-- CreateTable
CREATE TABLE "FallbackOffer" (
    "fallback_id" TEXT NOT NULL,
    "auction_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "bid_rank" INTEGER NOT NULL,
    "offered_amount" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FallbackOffer_pkey" PRIMARY KEY ("fallback_id")
);

-- CreateTable
CREATE TABLE "FraudFlag" (
    "flag_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "auction_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "risk_score" DECIMAL(65,30) NOT NULL,
    "flagged_by" "FlagSource" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FraudFlag_pkey" PRIMARY KEY ("flag_id")
);

-- CreateTable
CREATE TABLE "Dispute" (
    "dispute_id" TEXT NOT NULL,
    "auction_id" TEXT NOT NULL,
    "raised_by" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "against_user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Dispute_pkey" PRIMARY KEY ("dispute_id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "notification_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "auction_id" TEXT,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("notification_id")
);

-- CreateTable
CREATE TABLE "AdminAction" (
    "admin_action_id" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "action_type" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAction_pkey" PRIMARY KEY ("admin_action_id")
);

-- CreateTable
CREATE TABLE "SystemAuditLog" (
    "log_id" TEXT NOT NULL,
    "actor_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemAuditLog_pkey" PRIMARY KEY ("log_id")
);

-- CreateTable
CREATE TABLE "AuctionStateHistory" (
    "history_id" TEXT NOT NULL,
    "auction_id" TEXT NOT NULL,
    "previous_status" TEXT NOT NULL,
    "new_status" TEXT NOT NULL,
    "changed_by" TEXT NOT NULL,
    "reason" TEXT,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuctionStateHistory_pkey" PRIMARY KEY ("history_id")
);

-- CreateTable
CREATE TABLE "AuctionConnection" (
    "connection_id" TEXT NOT NULL,
    "auction_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "connected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "disconnected_at" TIMESTAMP(3),

    CONSTRAINT "AuctionConnection_pkey" PRIMARY KEY ("connection_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_user_id_key" ON "Wallet"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "AuctionRoom_auction_id_key" ON "AuctionRoom"("auction_id");

-- CreateIndex
CREATE UNIQUE INDEX "LetterBidReveal_commit_id_key" ON "LetterBidReveal"("commit_id");

-- CreateIndex
CREATE UNIQUE INDEX "AIAgentProfile_user_id_key" ON "AIAgentProfile"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "AuctionResult_auction_id_key" ON "AuctionResult"("auction_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSession" ADD CONSTRAINT "UserSession_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OTPVerification" ADD CONSTRAINT "OTPVerification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KYCProfile" ADD CONSTRAINT "KYCProfile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "Wallet"("wallet_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "Auction"("auction_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Auction" ADD CONSTRAINT "Auction_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuctionMedia" ADD CONSTRAINT "AuctionMedia_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "Auction"("auction_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuctionModerator" ADD CONSTRAINT "AuctionModerator_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "Auction"("auction_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuctionModerator" ADD CONSTRAINT "AuctionModerator_moderator_id_fkey" FOREIGN KEY ("moderator_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModeratorAction" ADD CONSTRAINT "ModeratorAction_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "Auction"("auction_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModeratorAction" ADD CONSTRAINT "ModeratorAction_moderator_id_fkey" FOREIGN KEY ("moderator_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuctionRoom" ADD CONSTRAINT "AuctionRoom_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "Auction"("auction_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "Auction"("auction_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LetterBidCommit" ADD CONSTRAINT "LetterBidCommit_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "Auction"("auction_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LetterBidCommit" ADD CONSTRAINT "LetterBidCommit_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LetterBidReveal" ADD CONSTRAINT "LetterBidReveal_commit_id_fkey" FOREIGN KEY ("commit_id") REFERENCES "LetterBidCommit"("commit_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSubscription" ADD CONSTRAINT "UserSubscription_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSubscription" ADD CONSTRAINT "UserSubscription_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "SubscriptionPlan"("plan_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIAgentProfile" ADD CONSTRAINT "AIAgentProfile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutoBidRule" ADD CONSTRAINT "AutoBidRule_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutoBidRule" ADD CONSTRAINT "AutoBidRule_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "Auction"("auction_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuctionResult" ADD CONSTRAINT "AuctionResult_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "Auction"("auction_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuctionResult" ADD CONSTRAINT "AuctionResult_winner_id_fkey" FOREIGN KEY ("winner_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuctionDeposit" ADD CONSTRAINT "AuctionDeposit_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "Auction"("auction_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuctionDeposit" ADD CONSTRAINT "AuctionDeposit_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FallbackOffer" ADD CONSTRAINT "FallbackOffer_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "Auction"("auction_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FallbackOffer" ADD CONSTRAINT "FallbackOffer_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FraudFlag" ADD CONSTRAINT "FraudFlag_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FraudFlag" ADD CONSTRAINT "FraudFlag_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "Auction"("auction_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "Auction"("auction_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_raised_by_fkey" FOREIGN KEY ("raised_by") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_against_user_id_fkey" FOREIGN KEY ("against_user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "Auction"("auction_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminAction" ADD CONSTRAINT "AdminAction_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemAuditLog" ADD CONSTRAINT "SystemAuditLog_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuctionStateHistory" ADD CONSTRAINT "AuctionStateHistory_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "Auction"("auction_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuctionConnection" ADD CONSTRAINT "AuctionConnection_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "Auction"("auction_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuctionConnection" ADD CONSTRAINT "AuctionConnection_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
