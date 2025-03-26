/*
  Warnings:

  - You are about to drop the column `emailVerified` on the `users` table. All the data in the column will be lost.
  - The `status` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `role` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `email` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "emailVerified",
ADD COLUMN     "email_verification_expires" TIMESTAMP(3),
ADD COLUMN     "email_verification_token" TEXT,
ADD COLUMN     "email_verified" TIMESTAMP(3),
ALTER COLUMN "email" SET NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING',
DROP COLUMN "role",
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'CUSTOMER';
