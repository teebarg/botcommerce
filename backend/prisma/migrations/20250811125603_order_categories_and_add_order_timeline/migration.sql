-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "display_order" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "order_timeline" (
    "id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "from_status" "OrderStatus",
    "to_status" "OrderStatus",
    "message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_timeline_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "order_timeline_order_id_created_at_idx" ON "order_timeline"("order_id", "created_at");

-- AddForeignKey
ALTER TABLE "order_timeline" ADD CONSTRAINT "order_timeline_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
