-- CreateTable
CREATE TABLE "eval_results" (
    "id" BIGSERIAL NOT NULL,
    "session_id" TEXT NOT NULL,
    "customer_id" INTEGER,
    "agent_name" TEXT,
    "agent_version" TEXT,
    "model_name" TEXT,
    "langfuse_trace_id" TEXT,
    "trace_metadata" JSONB,
    "user_message" TEXT,
    "agent_reply" TEXT,
    "escalated" BOOLEAN NOT NULL DEFAULT false,
    "sources" JSONB,
    "tools_called" JSONB,
    "latency_ms" DOUBLE PRECISION,
    "prompt_tokens" INTEGER,
    "completion_tokens" INTEGER,
    "total_tokens" INTEGER,
    "score_response_quality" DOUBLE PRECISION,
    "score_tool_accuracy" DOUBLE PRECISION,
    "score_escalation_accuracy" DOUBLE PRECISION,
    "score_latency" DOUBLE PRECISION,
    "score_groundedness" DOUBLE PRECISION,
    "score_context_relevance" DOUBLE PRECISION,
    "eval_notes" JSONB,
    "error" TEXT,
    "stacktrace" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eval_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "eval_results_session_id_idx" ON "eval_results"("session_id");

-- CreateIndex
CREATE INDEX "eval_results_customer_id_idx" ON "eval_results"("customer_id");

-- CreateIndex
CREATE INDEX "eval_results_created_at_idx" ON "eval_results"("created_at" DESC);

-- CreateIndex
CREATE INDEX "eval_results_agent_name_idx" ON "eval_results"("agent_name");

-- CreateIndex
CREATE INDEX "eval_results_agent_version_idx" ON "eval_results"("agent_version");

-- CreateIndex
CREATE INDEX "eval_results_model_name_idx" ON "eval_results"("model_name");

-- CreateIndex
CREATE INDEX "eval_results_agent_name_created_at_idx" ON "eval_results"("agent_name", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "eval_results" ADD CONSTRAINT "eval_results_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
