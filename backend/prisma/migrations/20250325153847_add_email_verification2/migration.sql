/*
  Warnings:

  - The `status` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `role` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "status",
ADD COLUMN     "status" "statuses" NOT NULL DEFAULT 'pending',
DROP COLUMN "role",
ADD COLUMN     "role" "roles" NOT NULL DEFAULT 'customer';
