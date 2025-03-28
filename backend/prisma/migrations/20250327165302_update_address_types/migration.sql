-- CreateEnum
CREATE TYPE "AddressType" AS ENUM ('HOME', 'WORK', 'BILLING', 'SHIPPING', 'OTHER');

-- AlterTable
ALTER TABLE "addresses" ADD COLUMN     "address_type" "AddressType" NOT NULL DEFAULT 'HOME',
ADD COLUMN     "label" TEXT;
