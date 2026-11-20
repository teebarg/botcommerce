import { useState, useMemo, useEffect } from "react";
import { LayoutGrid, Rows3, ShoppingBag } from "lucide-react";
import ProductGridItem from "@/components/album/ProductGridItem";
import type { Campaign } from "@/server/product.server";
import { Link } from "@tanstack/react-router";
import { ProductSearch } from "@/schemas";
import ProductCard from "@/components/store/products/product-card-revamped-dynamic";
import { toSelectedItem, useQuickOrderSelection } from "@/hooks/useQuickOrderSelection";
import { QuickOrderBar } from "@/components/store/quick-order-bar";
import { OptionsSheet } from "@/components/store/products/options-sheet";
import { useFeedUi } from "@/hooks/useFeedUi";
import NoProductsFound from "@/components/store/products/no-products";

interface AlbumPageProps {
    data: Campaign;
}

export default function AlbumPage({ data }: AlbumPageProps) {
    const { view, setView } = useFeedUi({
        defaultView: "list",
    });
    const { items, ids, variantIds, toggle, remove, clear } = useQuickOrderSelection();
    const [choosingProduct, setChoosingProduct] = useState<ProductSearch | null>(null);

    const products: ProductSearch[] = data.products;

    const selectedItems = useMemo(() => {
        const liveById = new Map(products.map((p) => [p.id, p]));
        return items.flatMap((item) => {
            const live = liveById.get(item.id);
            if (!live) return [item];
            // Refresh price and label from the exact variant, and drop it if it sold out.
            const variant = live.variants?.find((v) => v.id === item.variantId);
            return variant && variant.inventory > 0 ? [toSelectedItem(live, variant)] : [];
        });
    }, [items, products]);

    const hideNav = selectedItems.length > 0;
    useEffect(() => {
        if (!hideNav) return;
        const root = document.documentElement;
        root.dataset.quickOrder = "selecting";
        return () => {
            delete root.dataset.quickOrder;
        };
    }, [hideNav]);

    const handleOpenFromGrid = (id: number) => {
        setView("list");
        // wait for list view to render, then scroll to the product
        requestAnimationFrame(() => {
            const el = document.getElementById(`product-${id}`);
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    };

    if (products.length === 0) {
        return <NoProductsFound />;
    }

    return (
        <div className="min-h-screen">
            <header className="sticky top-[var(--sat)] z-30 border-b border-muted glass">
                <div className="mx-auto flex max-w-lg items-center justify-between p-2">
                    <Link to="/" className="active:scale-95 transition-transform">
                        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-xs shadow-primary/20">
                            <ShoppingBag className="w-4.5 h-4.5 text-white" />
                        </div>
                    </Link>
                    <div className="flex items-center gap-1 rounded-full border p-1">
                        <button
                            onClick={() => setView("list")}
                            aria-label="Single column view"
                            className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${view === "list" ? "bg-foreground text-background" : "text-muted-foreground"
                                }`}
                        >
                            <Rows3 className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setView("grid")}
                            aria-label="Grid view"
                            className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${view === "grid" ? "bg-foreground text-background" : "text-muted-foreground"
                                }`}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-xl w-full">
                {view === "list" ? (
                    <div>
                        {data.products.map((product: ProductSearch) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                selectable={true}
                                selected={ids.has(product.id)}
                                onSelect={() => toggle(toSelectedItem(product))}
                                onChoose={() => setChoosingProduct(product)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2">
                        {data.products.map((p) => (
                            <ProductGridItem
                                key={p.id}
                                product={p}
                                isSelected={ids.has(p.id)}
                                onToggle={() => toggle(toSelectedItem(p))}
                                onOpen={() => handleOpenFromGrid(p.id)}
                            />
                        ))}
                    </div>
                )}
            </main>

            <QuickOrderBar items={selectedItems} onRemove={remove} onClear={clear} onSent={clear} />
            <OptionsSheet
                product={choosingProduct}
                open={!!choosingProduct}
                onOpenChange={(next) => !next && setChoosingProduct(null)}
                confirmLabel="Add to selection"
                showWhatsApp={false}
                selectedIds={variantIds}
                onConfirm={(variant) => choosingProduct && toggle(toSelectedItem(choosingProduct, variant))}
            />
        </div>
    );
}
