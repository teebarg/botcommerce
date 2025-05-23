-- CreateEnum
CREATE TYPE "ConversationStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "MessageSender" AS ENUM ('USER', 'BOT', 'SYSTEM');

-- CreateTable
CREATE TABLE "conversations" (
    "id" SERIAL NOT NULL,
    "conversation_uuid" TEXT NOT NULL,
    "user_id" INTEGER,
    "status" "ConversationStatus" NOT NULL DEFAULT 'ACTIVE',
    "metadata" JSONB,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_active" TIMESTAMP(3) NOT NULL,
    "ended_at" TIMESTAMP(3),

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" SERIAL NOT NULL,
    "conversation_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "sender" "MessageSender" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faqs" (
    "id" SERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "category" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faqs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "conversations_conversation_uuid_key" ON "conversations"("conversation_uuid");

-- CreateIndex
CREATE INDEX "conversations_user_id_status_idx" ON "conversations"("user_id", "status");

-- CreateIndex
CREATE INDEX "conversations_conversation_uuid_idx" ON "conversations"("conversation_uuid");

-- CreateIndex
CREATE INDEX "messages_conversation_id_timestamp_idx" ON "messages"("conversation_id", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "faqs_question_key" ON "faqs"("question");

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
