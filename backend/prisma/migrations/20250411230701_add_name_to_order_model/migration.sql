/*
  Warnings:

  - A unique constraint covering the columns `[account_number]` on the table `bank_details` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "cart_items" ADD COLUMN     "name" TEXT;

-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "name" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "bank_details_account_number_key" ON "bank_details"("account_number");
