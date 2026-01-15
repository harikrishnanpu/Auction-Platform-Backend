/*
  Warnings:

  - You are about to drop the `AIAgentProfile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AdminAction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Auction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AuctionConnection` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AuctionDeposit` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AuctionMedia` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AuctionModerator` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AuctionResult` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AuctionRoom` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AuctionStateHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AutoBidRule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Bid` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Dispute` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FallbackOffer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FraudFlag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LetterBidCommit` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LetterBidReveal` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ModeratorAction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SubscriptionPlan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SystemAuditLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserSubscription` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Wallet` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WalletTransaction` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AIAgentProfile" DROP CONSTRAINT "AIAgentProfile_user_id_fkey";

-- DropForeignKey
ALTER TABLE "AdminAction" DROP CONSTRAINT "AdminAction_admin_id_fkey";

-- DropForeignKey
ALTER TABLE "Auction" DROP CONSTRAINT "Auction_seller_id_fkey";

-- DropForeignKey
ALTER TABLE "AuctionConnection" DROP CONSTRAINT "AuctionConnection_auction_id_fkey";

-- DropForeignKey
ALTER TABLE "AuctionConnection" DROP CONSTRAINT "AuctionConnection_user_id_fkey";

-- DropForeignKey
ALTER TABLE "AuctionDeposit" DROP CONSTRAINT "AuctionDeposit_auction_id_fkey";

-- DropForeignKey
ALTER TABLE "AuctionDeposit" DROP CONSTRAINT "AuctionDeposit_user_id_fkey";

-- DropForeignKey
ALTER TABLE "AuctionMedia" DROP CONSTRAINT "AuctionMedia_auction_id_fkey";

-- DropForeignKey
ALTER TABLE "AuctionModerator" DROP CONSTRAINT "AuctionModerator_auction_id_fkey";

-- DropForeignKey
ALTER TABLE "AuctionModerator" DROP CONSTRAINT "AuctionModerator_moderator_id_fkey";

-- DropForeignKey
ALTER TABLE "AuctionResult" DROP CONSTRAINT "AuctionResult_auction_id_fkey";

-- DropForeignKey
ALTER TABLE "AuctionResult" DROP CONSTRAINT "AuctionResult_winner_id_fkey";

-- DropForeignKey
ALTER TABLE "AuctionRoom" DROP CONSTRAINT "AuctionRoom_auction_id_fkey";

-- DropForeignKey
ALTER TABLE "AuctionStateHistory" DROP CONSTRAINT "AuctionStateHistory_auction_id_fkey";

-- DropForeignKey
ALTER TABLE "AutoBidRule" DROP CONSTRAINT "AutoBidRule_auction_id_fkey";

-- DropForeignKey
ALTER TABLE "AutoBidRule" DROP CONSTRAINT "AutoBidRule_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Bid" DROP CONSTRAINT "Bid_auction_id_fkey";

-- DropForeignKey
ALTER TABLE "Bid" DROP CONSTRAINT "Bid_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Dispute" DROP CONSTRAINT "Dispute_against_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Dispute" DROP CONSTRAINT "Dispute_auction_id_fkey";

-- DropForeignKey
ALTER TABLE "Dispute" DROP CONSTRAINT "Dispute_raised_by_fkey";

-- DropForeignKey
ALTER TABLE "FallbackOffer" DROP CONSTRAINT "FallbackOffer_auction_id_fkey";

-- DropForeignKey
ALTER TABLE "FallbackOffer" DROP CONSTRAINT "FallbackOffer_user_id_fkey";

-- DropForeignKey
ALTER TABLE "FraudFlag" DROP CONSTRAINT "FraudFlag_auction_id_fkey";

-- DropForeignKey
ALTER TABLE "FraudFlag" DROP CONSTRAINT "FraudFlag_user_id_fkey";

-- DropForeignKey
ALTER TABLE "LetterBidCommit" DROP CONSTRAINT "LetterBidCommit_auction_id_fkey";

-- DropForeignKey
ALTER TABLE "LetterBidCommit" DROP CONSTRAINT "LetterBidCommit_user_id_fkey";

-- DropForeignKey
ALTER TABLE "LetterBidReveal" DROP CONSTRAINT "LetterBidReveal_commit_id_fkey";

-- DropForeignKey
ALTER TABLE "ModeratorAction" DROP CONSTRAINT "ModeratorAction_auction_id_fkey";

-- DropForeignKey
ALTER TABLE "ModeratorAction" DROP CONSTRAINT "ModeratorAction_moderator_id_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_auction_id_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_user_id_fkey";

-- DropForeignKey
ALTER TABLE "SystemAuditLog" DROP CONSTRAINT "SystemAuditLog_actor_id_fkey";

-- DropForeignKey
ALTER TABLE "UserSubscription" DROP CONSTRAINT "UserSubscription_plan_id_fkey";

-- DropForeignKey
ALTER TABLE "UserSubscription" DROP CONSTRAINT "UserSubscription_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Wallet" DROP CONSTRAINT "Wallet_user_id_fkey";

-- DropForeignKey
ALTER TABLE "WalletTransaction" DROP CONSTRAINT "WalletTransaction_auction_id_fkey";

-- DropForeignKey
ALTER TABLE "WalletTransaction" DROP CONSTRAINT "WalletTransaction_wallet_id_fkey";

-- DropTable
DROP TABLE "AIAgentProfile";

-- DropTable
DROP TABLE "AdminAction";

-- DropTable
DROP TABLE "Auction";

-- DropTable
DROP TABLE "AuctionConnection";

-- DropTable
DROP TABLE "AuctionDeposit";

-- DropTable
DROP TABLE "AuctionMedia";

-- DropTable
DROP TABLE "AuctionModerator";

-- DropTable
DROP TABLE "AuctionResult";

-- DropTable
DROP TABLE "AuctionRoom";

-- DropTable
DROP TABLE "AuctionStateHistory";

-- DropTable
DROP TABLE "AutoBidRule";

-- DropTable
DROP TABLE "Bid";

-- DropTable
DROP TABLE "Dispute";

-- DropTable
DROP TABLE "FallbackOffer";

-- DropTable
DROP TABLE "FraudFlag";

-- DropTable
DROP TABLE "LetterBidCommit";

-- DropTable
DROP TABLE "LetterBidReveal";

-- DropTable
DROP TABLE "ModeratorAction";

-- DropTable
DROP TABLE "Notification";

-- DropTable
DROP TABLE "SubscriptionPlan";

-- DropTable
DROP TABLE "SystemAuditLog";

-- DropTable
DROP TABLE "UserSubscription";

-- DropTable
DROP TABLE "Wallet";

-- DropTable
DROP TABLE "WalletTransaction";

-- DropEnum
DROP TYPE "AuctionStatus";

-- DropEnum
DROP TYPE "FlagSource";
