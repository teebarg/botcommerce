/*
  Warnings:

  - A unique constraint covering the columns `[cart_number]` on the table `carts` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cart_number` to the `carts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "carts" ADD COLUMN     "cart_number" TEXT NOT NULL,
ALTER COLUMN "user_id" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "carts_cart_number_key" ON "carts"("cart_number");
