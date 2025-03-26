/*
  Warnings:

  - You are about to drop the `_ProductBrands` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ProductBrands" DROP CONSTRAINT "_ProductBrands_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProductBrands" DROP CONSTRAINT "_ProductBrands_B_fkey";

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "brand_id" INTEGER;

-- DropTable
DROP TABLE "_ProductBrands";

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;
