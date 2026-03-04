-- AlterTable
ALTER TABLE "conversations" ADD COLUMN     "human_connected" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_escalated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "support_id" INTEGER,
ADD COLUMN     "support_name" TEXT;

-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "metadata" JSONB;
