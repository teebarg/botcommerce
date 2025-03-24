/*
  Warnings:

  - Added the required column `payment_method` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "payment_method" "PaymentMethod" NOT NULL;
