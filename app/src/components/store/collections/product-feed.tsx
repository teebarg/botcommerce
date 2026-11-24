import { InfiniteList } from "@/components/InfiniteList";
import { FeedQuery, ProductSearch } from "@/schemas";
import ProductCard from "@/components/store/products/product-card-revamped-dynamic";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { productFeedInfiniteQuery } from "@/queries/user.queries";
import NoProductsFound from "@/components/store/products/no-products";
import { useEffect, useMemo, useState } from "react";
import { ImageLightbox, useLightbox } from "@/components/image-lightbox-revamp";
import { useFeedUi } from "@/hooks/useFeedUi";
import { QuickOrderBar } from "@/components/store/quick-order-bar";
import { OptionsSheet } from "@/components/store/products/options-sheet";
import { cn } from "@/utils/cn";
import { toSelectedItem, useQuickOrderSelection } from "@/hooks/useQuickOrderSelection";
import { FloatingViewToggle } from "../floating-view-toggle";
import FloatingActionDeck from "./floating-deck";

interface Props {
    params?: FeedQuery;
}

export function ProductFeed({ params }: Props) {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useSuspenseInfiniteQuery(productFeedInfiniteQuery(params));
    const { open, setOpen } = useLightbox();
    const [selectedProduct, setSelectedProduct] = useState<ProductSearch | null>(null);
    const { view, setView } = useFeedUi({
        defaultView: "grid",
    });

    const { items, variantIds, toggle, remove, updateQuantity, clear, isSyncing } = useQuickOrderSelection();
    const [choosingProduct, setChoosingProduct] = useState<ProductSearch | null>(null);

    const products: ProductSearch[] = data.pages.flatMap((page) => page.products);

    const selectedItems = useMemo(() => {
        const liveById = new Map(products.map((p) => [p.slug, p]));
        return items.flatMap((item) => {
            const live = liveById.get(item.slug);
            if (!live) return [item];
            // Keep cart price/quantity/variant authoritative; enrich only the product image/id.
            return [{ ...item, id: live.id, image: live.image || item.image }];
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

    const handleProductClick = (product: ProductSearch) => {
        setSelectedProduct(product);
        setOpen(true);
    };

    if (products.length === 0) {
        return <NoProductsFound />;
    }

    return (
        <>
            <FloatingViewToggle view={view} onChange={setView} />
            <FloatingActionDeck />
            <div className={cn(selectedItems.length > 0 && "pb-[calc(7rem+var(--bottom-nav-h,0px))]")}>
                <p className="mx-2 mb-2 rounded-lg bg-muted/70 px-3 py-2 text-xs text-muted-foreground">
                    Tap to add to cart · Hold an item for details
                </p>
                <InfiniteList hasMore={!!hasNextPage} isLoading={isFetchingNextPage} onLoadMore={fetchNextPage}>
                    <div
                        className={cn(
                            "grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 py-2 gap-1 px-0.5",
                            view === "list" ? "grid-cols-1" : "grid-cols-2"
                        )}
                    >
                        {products.map((product: ProductSearch, index: number) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                priority={index < 4}
                                onClick={() => handleProductClick(product)}
                                selected={product.variants?.some((variant) => variantIds.has(variant.id)) ?? false}
                                onSelect={() => toggle(toSelectedItem(product))}
                                onChoose={() => setChoosingProduct(product)}
                            />
                        ))}
                    </div>
                </InfiniteList>
            </div>
            <QuickOrderBar items={selectedItems} onRemove={remove} onQuantityChange={updateQuantity} onClear={clear} isSyncing={isSyncing} />
            <OptionsSheet
                product={choosingProduct}
                open={!!choosingProduct}
                onOpenChange={(next) => !next && setChoosingProduct(null)}
                confirmLabel="Add to cart"
                showWhatsApp={false}
                selectedIds={variantIds}
                onConfirm={(variant) => { if (choosingProduct) void toggle(toSelectedItem(choosingProduct, variant)); }}
            />
            <ImageLightbox
                images={selectedProduct?.images?.map((i: string, idx: number) => ({ id: idx, image: i })) || []}
                open={open}
                onOpenChange={setOpen}
                size={selectedProduct?.variants?.[0]?.size}
            />
        </>
    );
}
