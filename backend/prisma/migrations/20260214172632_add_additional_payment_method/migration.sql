/*
  Warnings:

  - You are about to drop the column `createdAt` on the `wallet_transactions` table. All the data in the column will be lost.
  - You are about to drop the column `referenceId` on the `wallet_transactions` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "PaymentMethod" ADD VALUE 'WALLET';

-- AlterTable
ALTER TABLE "wallet_transactions" DROP COLUMN "createdAt",
DROP COLUMN "referenceId",
ADD COLUMN     "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "reference_id" TEXT;
