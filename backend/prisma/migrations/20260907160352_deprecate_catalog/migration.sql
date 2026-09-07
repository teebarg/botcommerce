/*
  Warnings:

  - You are about to drop the `_SharedCollectionProducts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `shared_collection_views` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `shared_collections` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_SharedCollectionProducts" DROP CONSTRAINT "_SharedCollectionProducts_A_fkey";

-- DropForeignKey
ALTER TABLE "_SharedCollectionProducts" DROP CONSTRAINT "_SharedCollectionProducts_B_fkey";

-- DropForeignKey
ALTER TABLE "shared_collection_views" DROP CONSTRAINT "shared_collection_views_shared_collection_id_fkey";

-- DropForeignKey
ALTER TABLE "shared_collection_views" DROP CONSTRAINT "shared_collection_views_user_id_fkey";

-- DropTable
DROP TABLE "_SharedCollectionProducts";

-- DropTable
DROP TABLE "shared_collection_views";

-- DropTable
DROP TABLE "shared_collections";
