/*
  Warnings:

  - You are about to drop the column `status` on the `products` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "shared_collection_views" DROP CONSTRAINT "shared_collection_views_shared_collection_id_fkey";

-- DropForeignKey
ALTER TABLE "shared_collection_views" DROP CONSTRAINT "shared_collection_views_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_interactions" DROP CONSTRAINT "user_interactions_product_id_fkey";

-- DropForeignKey
ALTER TABLE "user_interactions" DROP CONSTRAINT "user_interactions_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_preferences" DROP CONSTRAINT "user_preferences_user_id_fkey";

-- AlterTable
ALTER TABLE "products" DROP COLUMN "status";

-- AddForeignKey
ALTER TABLE "user_interactions" ADD CONSTRAINT "user_interactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_interactions" ADD CONSTRAINT "user_interactions_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "shared_collection_views" ADD CONSTRAINT "shared_collection_views_shared_collection_id_fkey" FOREIGN KEY ("shared_collection_id") REFERENCES "shared_collections"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "shared_collection_views" ADD CONSTRAINT "shared_collection_views_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
