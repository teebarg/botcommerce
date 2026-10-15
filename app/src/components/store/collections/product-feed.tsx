import { InfiniteList } from "@/components/InfiniteList";
import { FeedQuery, ProductSearch } from "@/schemas";
import ProductCard from "@/components/store/products/product-card-revamped-dynamic";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { productFeedInfiniteQuery } from "@/queries/user.queries";
import NoProductsFound from "@/components/store/products/no-products";
import { useEffect, useMemo, useState } from "react";
import { ImageLightbox, useLightbox } from "@/components/image-lightbox-revamp";
import { useFeedUi } from "@/hooks/useFeedUi";
import { QuickOrderBar } from "../quick-order-bar";
import { LayoutGrid, MessageCircle, Square } from "lucide-react";
import { cn } from "@/utils/cn";
import { toSelectedItem, useQuickOrderSelection } from "@/hooks/useQuickOrderSelection";

const HIDE_NAV_WHILE_SELECTING = true;

interface Props {
    params?: FeedQuery;
}

export function ProductFeed({ params }: Props) {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useSuspenseInfiniteQuery(productFeedInfiniteQuery(params));
    const { open, setOpen } = useLightbox();
    const [selectedProduct, setSelectedProduct] = useState<ProductSearch | null>(null);
    const { quick, view, setView, setQuick } = useFeedUi();

    const { items, ids, toggle, clear } = useQuickOrderSelection();

    const products = data.pages.flatMap((page) => page.products);
    const selectedItems = useMemo(() => {
        const liveById = new Map(products.map((p) => [p.id, p]));
        return items.flatMap((item) => {
            const live = liveById.get(item.id);
            if (!live) return [item];
            return live.in_stock ? [toSelectedItem(live)] : [];
        });
    }, [items, products]);

    const hideNav = HIDE_NAV_WHILE_SELECTING && quick && selectedItems.length > 0;
    useEffect(() => {
        if (!hideNav) return;
        const root = document.documentElement;
        root.dataset.quickOrder = "selecting";
        return () => {
            delete root.dataset.quickOrder;
        };
    }, [hideNav]);

    const handleProductClick = (product: ProductSearch) => {
        setSelectedProduct(product);
        setOpen(true);
    };

    if (products.length === 0) {
        return <NoProductsFound />;
    }

    return (
        <>
            <div className="mb-3 flex items-center justify-between gap-2 px-2">
                <button
                    type="button"
                    onClick={() => setQuick(!quick)}
                    aria-pressed={quick}
                    className={cn(
                        "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                        quick ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground"
                    )}
                >
                    <MessageCircle className="h-4 w-4" />
                    {quick ? "Quick order: on" : "Order via WhatsApp"}
                </button>

                {/* Column toggle only matters on mobile; md+ always uses its own grid */}
                <div className="flex overflow-hidden rounded-full border border-border md:hidden" role="group" aria-label="Layout">
                    <button
                        type="button"
                        onClick={() => setView("list")}
                        aria-label="Single column"
                        aria-pressed={view === "list"}
                        className={cn("px-3 py-1.5", view === "list" ? "bg-foreground text-background" : "bg-background")}
                    >
                        <Square className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => setView("grid")}
                        aria-label="Two columns"
                        aria-pressed={view === "grid"}
                        className={cn("px-3 py-1.5", view === "grid" ? "bg-foreground text-background" : "bg-background")}
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className={cn(quick && selectedItems.length > 0 && "pb-[calc(6rem+var(--bottom-nav-h,0px))]")}>
                <InfiniteList hasMore={!!hasNextPage} isLoading={isFetchingNextPage} onLoadMore={fetchNextPage}>
                    <div
                        className={cn(
                            "grid md:grid-cols-3 lg:grid-cols-4 md:gap-2",
                            quick ? " sm:gap-1.5" : "gap-1.5",
                            view === "list" ? "grid-cols-1" : "grid-cols-2"
                        )}
                    >
                        {products.map((product: ProductSearch) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onClick={() => handleProductClick(product)}
                                selectable={quick}
                                selected={ids.has(product.id)}
                                onSelect={() => toggle(toSelectedItem(product))}
                            />
                        ))}
                    </div>
                </InfiniteList>
            </div>

            {quick && <QuickOrderBar items={selectedItems} onClear={clear} onSent={clear} />}

            <ImageLightbox
                images={selectedProduct?.images?.map((i: string, idx: number) => ({ id: idx, image: i })) || []}
                open={open}
                onOpenChange={setOpen}
                size={selectedProduct?.variants?.[0]?.size}
            />
        </>
    );
}
