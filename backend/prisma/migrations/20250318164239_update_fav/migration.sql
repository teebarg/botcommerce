/*
  Warnings:

  - A unique constraint covering the columns `[user_id,product_id]` on the table `favorites` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "cart_items" DROP CONSTRAINT "cart_items_variant_id_fkey";

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "features" TEXT[];

-- CreateIndex
CREATE UNIQUE INDEX "favorites_user_id_product_id_key" ON "favorites"("user_id", "product_id");

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
