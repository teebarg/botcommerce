/*
  Warnings:

  - You are about to drop the `UserInteraction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserPreference` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserInteraction" DROP CONSTRAINT "UserInteraction_product_id_fkey";

-- DropForeignKey
ALTER TABLE "UserInteraction" DROP CONSTRAINT "UserInteraction_user_id_fkey";

-- DropForeignKey
ALTER TABLE "UserPreference" DROP CONSTRAINT "UserPreference_user_id_fkey";

-- DropTable
DROP TABLE "UserInteraction";

-- DropTable
DROP TABLE "UserPreference";

-- CreateTable
CREATE TABLE "user_interactions" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "type" "InteractionType" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "user_interactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "brand" TEXT,
    "priceRange" TEXT,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 1.0,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_interactions_user_id_timestamp_idx" ON "user_interactions"("user_id", "timestamp");

-- CreateIndex
CREATE INDEX "user_interactions_product_id_timestamp_idx" ON "user_interactions"("product_id", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_user_id_category_brand_key" ON "user_preferences"("user_id", "category", "brand");

-- AddForeignKey
ALTER TABLE "user_interactions" ADD CONSTRAINT "user_interactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_interactions" ADD CONSTRAINT "user_interactions_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
