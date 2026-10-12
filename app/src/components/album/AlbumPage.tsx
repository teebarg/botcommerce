import React, { useState, useCallback } from "react";
import { LayoutGrid, Rows3 } from "lucide-react";
import ProductCard from "@/components/album/ProductCard";
import ProductGridItem from "@/components/album/ProductGridItem";
import SelectionBar from "@/components/album/SelectionBar";
import SelectionReview from "@/components/album/SelectionReview";
import { products } from "@/data/products";
import { albumConfig } from "@/data/albumConfig";

export default function AlbumPage() {
    const [view, setView] = useState("list"); // 'list' | 'grid'
    const [selectedIds, setSelectedIds] = useState(() => new Set());
    const [reviewOpen, setReviewOpen] = useState(false);

    const toggleSelect = useCallback((id) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const handleOpenFromGrid = (id) => {
        setView("list");
        // wait for list view to render, then scroll to the product
        requestAnimationFrame(() => {
            const el = document.getElementById(`product-${id}`);
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    };

    const selectedProducts = products.filter((p) => selectedIds.has(p.id));
    const total = selectedProducts.reduce((sum, p) => sum + p.price, 0);

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="sticky top-0 z-30 border-b border-muted glass">
                <div className="mx-auto flex max-w-md items-center justify-between py-3 px-5">
                    <div>
                        <h1 className="font-serif text-lg leading-none tracking-tight">{albumConfig.title}</h1>
                    </div>
                    <div className="flex items-center gap-1 rounded-full border p-1">
                        <button
                            onClick={() => setView("list")}
                            aria-label="Single column view"
                            className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                                view === "list" ? "bg-foreground text-background" : "text-muted-foreground"
                            }`}
                        >
                            <Rows3 className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setView("grid")}
                            aria-label="Grid view"
                            className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                                view === "grid" ? "bg-foreground text-background" : "text-muted-foreground"
                            }`}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Body */}
            <main className="mx-auto max-w-md">
                {view === "list" ? (
                    <div className="space-y-12p">
                        {products.map((p) => (
                            <ProductCard key={p.id} product={p} isSelected={selectedIds.has(p.id)} onToggle={toggleSelect} />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {products.map((p) => (
                            <ProductGridItem
                                key={p.id}
                                product={p}
                                isSelected={selectedIds.has(p.id)}
                                onToggle={toggleSelect}
                                onOpen={() => handleOpenFromGrid(p.id)}
                            />
                        ))}
                    </div>
                )}
            </main>

            <SelectionBar count={selectedIds.size} total={total} onReview={() => setReviewOpen(true)} />

            <SelectionReview
                open={reviewOpen}
                onClose={() => setReviewOpen(false)}
                selectedProducts={selectedProducts}
                onRemove={(id) => toggleSelect(id)}
                onClear={() => setSelectedIds(new Set())}
            />
        </div>
    );
}
