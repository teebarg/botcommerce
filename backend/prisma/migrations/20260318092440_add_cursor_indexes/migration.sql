-- CreateIndex
CREATE INDEX "activity_logs_user_id_created_at_idx" ON "activity_logs"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "activity_logs_created_at_id_idx" ON "activity_logs"("created_at" DESC, "id" DESC);

-- CreateIndex
CREATE INDEX "carts_user_id_status_idx" ON "carts"("user_id", "status");

-- CreateIndex
CREATE INDEX "conversations_status_last_active_idx" ON "conversations"("status", "last_active" DESC);

-- CreateIndex
CREATE INDEX "conversations_user_id_last_active_idx" ON "conversations"("user_id", "last_active" DESC);

-- CreateIndex
CREATE INDEX "favorites_user_id_created_at_idx" ON "favorites"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "messages_conversation_id_id_idx" ON "messages"("conversation_id", "id" DESC);

-- CreateIndex
CREATE INDEX "orders_user_id_created_at_idx" ON "orders"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "orders_status_created_at_idx" ON "orders"("status", "created_at" DESC);

-- CreateIndex
CREATE INDEX "orders_payment_status_created_at_idx" ON "orders"("payment_status", "created_at" DESC);

-- CreateIndex
CREATE INDEX "orders_user_id_status_idx" ON "orders"("user_id", "status");

-- CreateIndex
CREATE INDEX "reviews_product_id_id_idx" ON "reviews"("product_id", "id" DESC);

-- CreateIndex
CREATE INDEX "reviews_created_at_id_idx" ON "reviews"("created_at" DESC, "id" DESC);

-- CreateIndex
CREATE INDEX "user_interactions_user_id_type_timestamp_idx" ON "user_interactions"("user_id", "type", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "user_interactions_product_id_type_timestamp_idx" ON "user_interactions"("product_id", "type", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "wallet_transactions_user_id_created_at_idx" ON "wallet_transactions"("user_id", "created_at" DESC);
