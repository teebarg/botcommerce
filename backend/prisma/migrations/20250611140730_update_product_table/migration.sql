/*
  Warnings:

  - You are about to drop the column `old_price` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `products` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "products" DROP COLUMN "old_price",
DROP COLUMN "price";
