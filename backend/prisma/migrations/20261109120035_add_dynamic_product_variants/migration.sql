-- AlterTable
ALTER TABLE "product_variants" ADD COLUMN     "attributes" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "options" JSONB NOT NULL DEFAULT '[]';
