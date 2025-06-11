/*
  Warnings:

  - You are about to drop the column `image` on the `product_variants` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `product_variants` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `product_variants` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "product_variants_name_key";

-- DropIndex
DROP INDEX "product_variants_slug_key";

-- AlterTable
ALTER TABLE "product_variants" DROP COLUMN "image",
DROP COLUMN "name",
DROP COLUMN "slug";
