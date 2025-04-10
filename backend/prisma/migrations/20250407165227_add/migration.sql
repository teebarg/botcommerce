-- CreateEnum
CREATE TYPE "ShopSettingsType" AS ENUM ('FEATURE', 'SHOP_DETAIL', 'CUSTOM');

-- CreateTable
CREATE TABLE "shop_settings" (
    "id" SERIAL NOT NULL,
    "key" VARCHAR(255) NOT NULL,
    "value" TEXT,
    "type" "ShopSettingsType" NOT NULL DEFAULT 'FEATURE',
    "category" VARCHAR(100),
    "description" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shop_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "shop_settings_key_key" ON "shop_settings"("key");
