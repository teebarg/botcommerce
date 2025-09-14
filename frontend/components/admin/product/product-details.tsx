"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

import { ProductQuery } from "./product-query";

import { Badge } from "@/components/ui/badge";
import { ProductActions } from "@/components/admin/product/product-actions";
import { Collection, ProductSearch, ProductVariant } from "@/schemas/product";
import { Button } from "@/components/ui/button";
import { useProductInfiniteSearch } from "@/lib/hooks/useProduct";
import { useCollections } from "@/lib/hooks/useCollection";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import ComponentLoader from "@/components/component-loader";
import ServerError from "@/components/generic/server-error";

const LIMIT = 20;

export function ProductDetails() {
    const router = useRouter();
    const { data: collections } = useCollections();
    const searchParams = useSearchParams();
    const query = searchParams.get("search") || "";

    const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useProductInfiniteSearch({
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
        onIntersect: () => {
            if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
            }
        },
        isFetching: isFetchingNextPage,
    });

    if (isLoading) {
        return <ComponentLoader className="h-96" />;
    }

    if (!data) {
        return <ServerError />;
    }

    const products = data.pages.flatMap((page) => page.products);

    const handleManageCollections = () => {
        router.push("/admin/collections");
    };

    const handleManageCategories = () => {
        router.push("/admin/categories");
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
                    <Button className="text-xs" size="sm" variant="indigo" onClick={handleManageCollections}>
                        Collections
                    </Button>
                    <Button className="text-xs" size="sm" variant="indigo" onClick={handleManageCategories}>
                        Categories
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {products?.map((product: ProductSearch, idx: number) => {
                        const isLast = idx === products.length - 1;

                        return (
                            <div
                                key={`${product.id}-${idx}`}
                                ref={isLast ? (lastElementRef as any) : undefined}
                                className="relative bg-content1 border border-divider rounded-lg shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow"
                            >
                                <div className="relative aspect-product w-full bg-content1 overflow-hidden">
                                    <Image
                                        fill
                                        alt={product.name}
                                        blurDataURL="/placeholder.jpg"
                                        className="object-cover"
                                        placeholder="blur"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                        src={product.sorted_images?.[0] || product?.image || "/placeholder.jpg"}
                                    />

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
                                    <h3 className="font-semibold text-lg text-default-900 mb-2 line-clamp-1">{product.name}</h3>
                                    <div className="flex justify-end">
                                        <ProductActions product={product} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {isFetchingNextPage && <ComponentLoader className="h-[200px]" />}

                {products?.length === 0 && !isLoading && (
                    <div className="text-center py-8">
                        <p className="text-default-500">No products found</p>
                    </div>
                )}

                {!hasNextPage && products?.length > 0 && (
                    <div className="text-center py-4">
                        <p className="text-sm text-default-500">You&apos;ve reached the end of the list</p>
                    </div>
                )}
            </div>
        </div>
    );
}
