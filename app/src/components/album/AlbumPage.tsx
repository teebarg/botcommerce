import React, { useState, useCallback } from "react";
import { LayoutGrid, Rows3, ShoppingBag } from "lucide-react";
import ProductCard from "@/components/album/ProductCard";
import ProductGridItem from "@/components/album/ProductGridItem";
import SelectionBar from "@/components/album/SelectionBar";
import SelectionReview from "@/components/album/SelectionReview";
import type { Campaign } from "@/server/product.server";
import { Link } from "@tanstack/react-router";

interface AlbumPageProps {
    data: Campaign;
}

export default function AlbumPage({ data }: AlbumPageProps) {
    const [view, setView] = useState("list"); // 'list' | 'grid'
    const [selectedIds, setSelectedIds] = useState(() => new Set());
    const [reviewOpen, setReviewOpen] = useState(false);

    const toggleSelect = useCallback((id: number) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const handleOpenFromGrid = (id: number) => {
        setView("list");
        // wait for list view to render, then scroll to the product
        requestAnimationFrame(() => {
            const el = document.getElementById(`product-${id}`);
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    };

    const selectedProducts = data.products.filter((p) => selectedIds.has(p.id));
    const total = selectedProducts.reduce((sum, p) => sum + (p.price ?? 0), 0);

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="sticky top-0 z-30 border-b border-muted glass">
                <div className="mx-auto flex max-w-md items-center justify-between py-2 px-0.5">
                    <Link to="/" className="active:scale-95 transition-transform">
                        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-xs shadow-primary/20">
                            <ShoppingBag className="w-4.5 h-4.5 text-white" />
                        </div>
                    </Link>
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
            <main className="mx-auto max-w-lg">
                {view === "list" ? (
                    <div>
                        {data.products.map((p) => (
                            <ProductCard key={p.id} product={p} isSelected={selectedIds.has(p.id)} onToggle={toggleSelect} />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {data.products.map((p) => (
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
