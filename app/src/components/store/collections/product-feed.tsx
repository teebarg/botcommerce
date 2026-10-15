import { InfiniteList } from "@/components/InfiniteList";
import { FeedQuery, ProductSearch } from "@/schemas";
import ProductCard from "@/components/store/products/product-card-revamped";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { productFeedInfiniteQuery } from "@/queries/user.queries";
import NoProductsFound from "@/components/store/products/no-products";
import { useState } from "react";
import { ImageLightbox, useLightbox } from "@/components/image-lightbox-revamp";
import { useFeedUi } from "@/hooks/useFeedUi";
import { QuickOrderBar } from "../quick-order-bar";
import { LayoutGrid, MessageCircle, Square } from "lucide-react";
import { cn } from "@/utils/cn";

interface Props {
    params?: FeedQuery;
}

export function ProductFeed({ params }: Props) {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useSuspenseInfiniteQuery(productFeedInfiniteQuery(params));
    const { open, setOpen } = useLightbox();
    const [selectedProduct, setSelectedProduct] = useState<ProductSearch | null>(null);
    const { quick, view, setView, setQuick } = useFeedUi();

    const [selection, setSelection] = useState<Map<number, ProductSearch>>(new Map());

    const handleProductClick = (product: ProductSearch) => {
        setSelectedProduct(product);
        setOpen(true);
    };

    const toggleSelect = (product: ProductSearch) => {
        setSelection((prev) => {
            const next = new Map(prev);
            if (next.has(product.id)) next.delete(product.id);
            else next.set(product.id, product);
            return next;
        });
    };

    const products = data.pages.flatMap((page) => page.products);
    if (products.length === 0) {
        return <NoProductsFound />;
    }
    const selectedItems = Array.from(selection.values());
    return (
        <>
            <div className="mb-3 flex items-center justify-between gap-2">
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

            <div className={cn(quick && selectedItems.length > 0 && "pb-24")}>
                <InfiniteList hasMore={!!hasNextPage} isLoading={isFetchingNextPage} onLoadMore={fetchNextPage}>
                    <div className={cn("grid md:grid-cols-3 lg:grid-cols-4 md:gap-2 gap-1.5", view === "list" ? "grid-cols-1" : "grid-cols-2")}>
                        {products.map((product: ProductSearch) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onClick={() => handleProductClick(product)}
                                selectable={quick}
                                selected={selection.has(product.id)}
                                onSelect={() => toggleSelect(product)}
                            />
                        ))}
                    </div>
                </InfiniteList>
            </div>

            {quick && <QuickOrderBar items={selectedItems} onClear={() => setSelection(new Map())} />}

            <ImageLightbox
                images={selectedProduct?.images?.map((i: string, idx: number) => ({ id: idx, image: i })) || []}
                open={open}
                onOpenChange={setOpen}
                size={selectedProduct?.variants?.[0]?.size}
            />
        </>
    );
    return (
        <>
            <InfiniteList hasMore={!!hasNextPage} isLoading={isFetchingNextPage} onLoadMore={fetchNextPage}>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-2 gap-1.5">
                    {products?.map((product: ProductSearch, idx: number) => (
                        <ProductCard onClick={() => handleProductClick(product)} key={idx} product={product} />
                    ))}
                </div>
            </InfiniteList>
            <ImageLightbox
                images={selectedProduct?.images?.map((i: string, idx: number) => ({ id: idx, image: i })) || []}
                open={open}
                onOpenChange={setOpen}
                size={selectedProduct?.variants?.[0]?.size}
            />
        </>
    );
}
