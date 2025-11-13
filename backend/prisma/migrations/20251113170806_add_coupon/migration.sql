/*
  Warnings:

  - You are about to drop the column `expiration_date` on the `coupons` table. All the data in the column will be lost.
  - Added the required column `valid_from` to the `coupons` table without a default value. This is not possible if the table is not empty.
  - Added the required column `valid_until` to the `coupons` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CouponScope" AS ENUM ('GENERAL', 'SPECIFIC_USERS');

-- AlterTable
ALTER TABLE "carts" ADD COLUMN     "coupon_id" INTEGER,
ADD COLUMN     "discount_amount" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "coupons" DROP COLUMN "expiration_date",
ADD COLUMN     "assigned_users" JSONB,
ADD COLUMN     "current_uses" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "max_uses" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "min_cart_value" DOUBLE PRECISION,
ADD COLUMN     "min_item_quantity" INTEGER,
ADD COLUMN     "scope" "CouponScope" NOT NULL DEFAULT 'GENERAL',
ADD COLUMN     "valid_from" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "valid_until" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "discount_amount" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "coupon_users" (
    "id" SERIAL NOT NULL,
    "coupon_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "coupon_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "coupon_users_coupon_id_idx" ON "coupon_users"("coupon_id");

-- CreateIndex
CREATE INDEX "coupon_users_user_id_idx" ON "coupon_users"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "coupon_users_coupon_id_user_id_key" ON "coupon_users"("coupon_id", "user_id");

-- CreateIndex
CREATE INDEX "coupons_code_idx" ON "coupons"("code");

-- CreateIndex
CREATE INDEX "coupons_is_active_idx" ON "coupons"("is_active");

-- CreateIndex
CREATE INDEX "coupons_valid_from_valid_until_idx" ON "coupons"("valid_from", "valid_until");

-- AddForeignKey
ALTER TABLE "coupon_users" ADD CONSTRAINT "coupon_users_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "coupons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_users" ADD CONSTRAINT "coupon_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carts" ADD CONSTRAINT "carts_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "coupons"("id") ON DELETE SET NULL ON UPDATE CASCADE;
