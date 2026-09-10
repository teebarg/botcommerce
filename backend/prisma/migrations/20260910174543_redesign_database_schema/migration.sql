/*
  Warnings:

  - You are about to drop the column `address_type` on the `addresses` table. All the data in the column will be lost.
  - You are about to drop the column `billing_address_id` on the `carts` table. All the data in the column will be lost.
  - You are about to drop the column `billing_address_id` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the `bank_details` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `carousel_banners` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_interactions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_preferences` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'CONFIRMED';

-- DropForeignKey
ALTER TABLE "carts" DROP CONSTRAINT "carts_billing_address_id_fkey";

-- DropForeignKey
ALTER TABLE "eval_results" DROP CONSTRAINT "eval_results_customer_id_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_billing_address_id_fkey";

-- DropForeignKey
ALTER TABLE "user_interactions" DROP CONSTRAINT "user_interactions_product_id_fkey";

-- DropForeignKey
ALTER TABLE "user_interactions" DROP CONSTRAINT "user_interactions_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_preferences" DROP CONSTRAINT "user_preferences_user_id_fkey";

-- AlterTable
ALTER TABLE "addresses" DROP COLUMN "address_type";

-- AlterTable
ALTER TABLE "carts" DROP COLUMN "billing_address_id";

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "billing_address_id";

-- DropTable
DROP TABLE "bank_details";

-- DropTable
DROP TABLE "carousel_banners";

-- DropTable
DROP TABLE "user_interactions";

-- DropTable
DROP TABLE "user_preferences";

-- DropEnum
DROP TYPE "AddressType";

-- DropEnum
DROP TYPE "InteractionType";
