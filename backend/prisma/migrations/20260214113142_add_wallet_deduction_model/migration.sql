/*
  Warnings:

  - You are about to drop the column `wallet_ballance` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "carts" ADD COLUMN     "wallet_used" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "wallet_used" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "wallet_ballance",
ADD COLUMN     "wallet_balance" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "wallet_transactions" ADD COLUMN     "reference_code" TEXT;
