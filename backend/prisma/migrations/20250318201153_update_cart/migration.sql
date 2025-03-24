/*
  Warnings:

  - You are about to drop the column `last_updated` on the `carts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "carts" DROP COLUMN "last_updated",
ADD COLUMN     "billing_address_id" INTEGER,
ADD COLUMN     "payment_method" "PaymentMethod",
ADD COLUMN     "shipping_address_id" INTEGER,
ADD COLUMN     "shipping_method" "ShippingMethod",
ADD COLUMN     "updated_at" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "carts" ADD CONSTRAINT "carts_shipping_address_id_fkey" FOREIGN KEY ("shipping_address_id") REFERENCES "addresses"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carts" ADD CONSTRAINT "carts_billing_address_id_fkey" FOREIGN KEY ("billing_address_id") REFERENCES "addresses"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
