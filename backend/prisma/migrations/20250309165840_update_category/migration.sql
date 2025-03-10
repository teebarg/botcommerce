/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `categories` will be added. If there are existing duplicate values, this will fail.
  - Made the column `name` on table `categories` required. This step will fail if there are existing NULL values in that column.
  - Made the column `is_active` on table `categories` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "categories" DROP CONSTRAINT "categories_parent_id_fkey";

-- AlterTable
ALTER TABLE "categories" ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "name" SET DATA TYPE TEXT,
ALTER COLUMN "slug" SET DATA TYPE TEXT,
ALTER COLUMN "is_active" SET NOT NULL,
ALTER COLUMN "is_active" SET DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
