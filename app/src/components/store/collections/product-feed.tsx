import { InfiniteList } from "@/components/InfiniteList";
import { FeedQuery, ProductSearch } from "@/schemas";
import ProductCard from "@/components/store/products/product-card-revamped";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { productFeedInfiniteQuery } from "@/queries/user.queries";
import NoProductsFound from "@/components/store/products/no-products";
import { useState } from "react";
import { ImageLightbox, useLightbox } from "@/components/image-lightbox-revamp";

interface Props {
    params?: FeedQuery;
}

export function ProductFeed({ params }: Props) {
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useSuspenseInfiniteQuery(
        productFeedInfiniteQuery(params)
    );
    const { open, setOpen } = useLightbox();
    const [selectedProduct, setSelectedProduct] = useState<ProductSearch | null>(null);
    const handleProductClick = (product: ProductSearch) => {
        setSelectedProduct(product)
        setOpen(true)
    }

    const products = data.pages.flatMap(page => page.products);
    if (products.length === 0) {
        return <NoProductsFound />;
    }
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
                images={selectedProduct?.images || []}
                open={open}
                onOpenChange={setOpen}
                size={selectedProduct?.variants?.[0]?.size}
            />
        </>
    );
}