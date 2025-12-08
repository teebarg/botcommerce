import { useEffect, useState } from "react";
import { X } from "lucide-react";

import { ProductQuery } from "./product-query";

import { Badge } from "@/components/ui/badge";
import { ProductActions } from "@/components/admin/product/product-actions";
import type { Collection, PaginatedProductSearch, ProductSearch, ProductVariant } from "@/schemas/product";
import { Button } from "@/components/ui/button";
import { useProductInfiniteSearch } from "@/hooks/useProduct";
import { useCollections } from "@/hooks/useCollection";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import ComponentLoader from "@/components/component-loader";
import ServerError from "@/components/generic/server-error";
import ImageDisplay from "@/components/image-display";
import { useNavigate } from "@tanstack/react-router";

const LIMIT = 24;

export function ProductDetails() {
    const navigate = useNavigate();
    const { data: collections } = useCollections();
    const searchParams: any = null;
    const query = searchParams.get("search") || "";

    const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useProductInfiniteSearch({} as PaginatedProductSearch, {
        search: query,
        skip: 0,
        limit: LIMIT,
    });

    const [selectedCollections, setSelectedCollections] = useState<number[]>([]);

    const collectionIdsFromURL = searchParams.get("collections")?.split(",") || [];

    useEffect(() => {
        setSelectedCollections(collectionIdsFromURL.map(Number));
    }, [searchParams]);

    const { lastElementRef } = useInfiniteScroll({
        onLoadMore: () => {
            if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
            }
        },
        disabled: isFetchingNextPage,
    });

    if (isLoading) {
        return <ComponentLoader className="h-96" />;
    }

    if (!data) {
        return <ServerError />;
    }

    const products = data.pages.flatMap((page) => page.products);

    const handleManageCollections = () => {
        navigate({ to: "/admin/collections" });
    };

    const handleManageCategories = () => {
        navigate({ to: "/admin/categories" });
    };

    const getStatus = (variants: ProductVariant[] | undefined | null) => {
        if (!variants) return "Out of Stock";
        const variant = variants?.find((v) => v.inventory > 0);

        if (variant) {
            return "In Stock";
        }

        return "Out of Stock";
    };

    return (
        <div>
            <div className="py-4">
                <ProductQuery collections={collections} selectedCollections={selectedCollections} />

                {selectedCollections.length > 0 && (
                    <div className="mb-4 flex gap-2 flex-wrap">
                        {selectedCollections.map((id: number, idx: number) => {
                            const collection = collections?.find((c: Collection) => c.id === id);

                            if (!collection) return null;

                            return (
                                <div key={idx} className="bg-primary/10 text-primary text-sm rounded-full px-3 py-1 flex items-center">
                                    <p>{collection.name}</p>
                                    <button
                                        className="ml-1"
                                        onClick={() => {
                                            setSelectedCollections(selectedCollections.filter((cId) => cId !== id));
                                        }}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="flex justify-between mb-4">
                    <Button className="text-xs" size="sm" onClick={handleManageCollections}>
                        Collections
                    </Button>
                    <Button className="text-xs" size="sm" onClick={handleManageCategories}>
                        Categories
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {products?.map((product: ProductSearch, idx: number) => {
                        return (
                            <div
                                key={`${product.id}-${idx}`}
                                className="relative bg-card border border-input rounded-lg shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow"
                            >
                                <div className="relative aspect-product w-full bg-card overflow-hidden">
                                    <ImageDisplay alt={product.name} url={product?.images?.[0] || product?.image} />

                                    <div className="absolute top-2 right-2 flex flex-col gap-1">
                                        <Badge className="shadow-sm" variant={getStatus(product.variants) === "In Stock" ? "emerald" : "destructive"}>
                                            {getStatus(product.variants)}
                                        </Badge>
                                        <Badge className="shadow-sm" variant={product.active ? "emerald" : "destructive"}>
                                            {product.active ? "Active" : "Inactive"}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="p-4 flex flex-col justify-between flex-1">
                                    <h3 className="font-semibold text-lg mb-2 line-clamp-1">{product.name}</h3>
                                    <div className="flex justify-end">
                                        <ProductActions product={product} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                {hasNextPage && <div ref={lastElementRef} className="h-10" />}

                {isFetchingNextPage && <ComponentLoader className="h-[200px]" />}

                {products?.length === 0 && !isLoading && (
                    <div className="text-center py-8">
                        <p className="text-muted-foreground">No products found</p>
                    </div>
                )}

                {!hasNextPage && products?.length > 0 && (
                    <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground">You&apos;ve reached the end of the list</p>
                    </div>
                )}
            </div>
        </div>
    );
}
