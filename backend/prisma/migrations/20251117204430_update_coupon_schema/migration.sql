/*
  Warnings:

  - You are about to drop the column `expiration_date` on the `coupons` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "CouponScope" AS ENUM ('GENERAL', 'SPECIFIC_USERS');

-- AlterEnum
ALTER TYPE "PaymentMethod" ADD VALUE 'COUPON';

-- AlterTable
ALTER TABLE "carts" ADD COLUMN     "coupon_id" INTEGER,
ADD COLUMN     "discount_amount" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "coupons" DROP COLUMN "expiration_date",
ADD COLUMN     "current_uses" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "max_uses" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "max_uses_per_user" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "min_cart_value" DOUBLE PRECISION,
ADD COLUMN     "min_item_quantity" INTEGER,
ADD COLUMN     "scope" "CouponScope" NOT NULL DEFAULT 'GENERAL',
ADD COLUMN     "valid_from" TIMESTAMP(3),
ADD COLUMN     "valid_until" TIMESTAMP(3),
ALTER COLUMN "discount_type" SET DEFAULT 'PERCENTAGE';

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "discount_amount" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "coupon_usages" (
    "id" SERIAL NOT NULL,
    "coupon_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "discount_amount" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coupon_usages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CouponAllowedUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE INDEX "coupon_usages_coupon_id_user_id_idx" ON "coupon_usages"("coupon_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "_CouponAllowedUser_AB_unique" ON "_CouponAllowedUser"("A", "B");

-- CreateIndex
CREATE INDEX "_CouponAllowedUser_B_index" ON "_CouponAllowedUser"("B");

-- CreateIndex
CREATE INDEX "coupons_code_idx" ON "coupons"("code");

-- CreateIndex
CREATE INDEX "coupons_is_active_idx" ON "coupons"("is_active");

-- CreateIndex
CREATE INDEX "coupons_valid_from_valid_until_idx" ON "coupons"("valid_from", "valid_until");

-- AddForeignKey
ALTER TABLE "coupon_usages" ADD CONSTRAINT "coupon_usages_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "coupons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_usages" ADD CONSTRAINT "coupon_usages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carts" ADD CONSTRAINT "carts_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "coupons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CouponAllowedUser" ADD CONSTRAINT "_CouponAllowedUser_A_fkey" FOREIGN KEY ("A") REFERENCES "coupons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CouponAllowedUser" ADD CONSTRAINT "_CouponAllowedUser_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
