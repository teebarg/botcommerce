/*
  Warnings:

  - You are about to drop the column `category` on the `shop_settings` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `shop_settings` table. All the data in the column will be lost.
  - You are about to drop the column `is_public` on the `shop_settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "shop_settings" DROP COLUMN "category",
DROP COLUMN "description",
DROP COLUMN "is_public";

-- CreateTable
CREATE TABLE "bank_details" (
    "id" SERIAL NOT NULL,
    "bank_name" VARCHAR(255) NOT NULL,
    "account_name" VARCHAR(255) NOT NULL,
    "account_number" VARCHAR(255) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_details_pkey" PRIMARY KEY ("id")
);
