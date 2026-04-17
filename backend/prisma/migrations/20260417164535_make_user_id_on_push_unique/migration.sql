/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `push_subscriptions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "push_subscriptions_userId_key" ON "push_subscriptions"("userId");
