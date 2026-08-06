import { InfiniteList } from "@/components/InfiniteList";
import { ProductSearch } from "@/schemas";
import ProductCard from "@/components/store/products/product-card-revamped";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { catalogInfiniteQuery } from "@/queries/user.queries";
import NoProductsFound from "@/components/store/products/no-products";
import { ImageLightbox, useLightbox } from "@/components/image-lightbox-revamp";
import { useState } from "react";

interface Props {
    slug: string;
}

export function CatalogFeed({ slug }: Props) {
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useSuspenseInfiniteQuery(
        catalogInfiniteQuery(slug)
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
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2">
                    {products?.map((product: ProductSearch) => (
                        <ProductCard key={product.id} onClick={() => handleProductClick(product)} product={product} />
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
    )
}