-- CreateTable
CREATE TABLE "shared_collections" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shared_collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shared_collection_views" (
    "id" SERIAL NOT NULL,
    "shared_collection_id" INTEGER NOT NULL,
    "user_id" INTEGER,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shared_collection_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_SharedCollectionProducts" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "shared_collections_slug_key" ON "shared_collections"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "_SharedCollectionProducts_AB_unique" ON "_SharedCollectionProducts"("A", "B");

-- CreateIndex
CREATE INDEX "_SharedCollectionProducts_B_index" ON "_SharedCollectionProducts"("B");

-- AddForeignKey
ALTER TABLE "shared_collection_views" ADD CONSTRAINT "shared_collection_views_shared_collection_id_fkey" FOREIGN KEY ("shared_collection_id") REFERENCES "shared_collections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shared_collection_views" ADD CONSTRAINT "shared_collection_views_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SharedCollectionProducts" ADD CONSTRAINT "_SharedCollectionProducts_A_fkey" FOREIGN KEY ("A") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SharedCollectionProducts" ADD CONSTRAINT "_SharedCollectionProducts_B_fkey" FOREIGN KEY ("B") REFERENCES "shared_collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
