"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

import { ProductQuery } from "./product-query";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ProductActions } from "@/components/admin/product/product-actions";
import { Brand, Collection, Product, ProductVariant } from "@/schemas/product";
import ProductListItem from "@/components/admin/product/product-list-item";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/lib/hooks/useProduct";
import { useCollections } from "@/lib/hooks/useCollection";
import { useBrands } from "@/lib/hooks/useBrand";
import ComponentLoader from "@/components/component-loader";
import ServerError from "@/components/generic/server-error";
import PaginationUI from "@/components/pagination";
import { cn } from "@/lib/utils";

const LIMIT = 10;

export function ProductDetails() {
    const router = useRouter();
    const { data: collections } = useCollections();
    const { data: brands } = useBrands();
    const searchParams = useSearchParams();
    const page = Number(searchParams.get("page")) || 1;
    const { data, isLoading } = useProducts({ query: searchParams.get("search") || "", skip: (page - 1) * LIMIT });

    const [selectedCollections, setSelectedCollections] = useState<number[]>([]);
    const [selectedBrands, setSelectedBrands] = useState<number[]>([]);

    const brandIdsFromURL = searchParams.get("brands")?.split(",") || [];
    const collectionIdsFromURL = searchParams.get("collections")?.split(",") || [];

    useEffect(() => {
        setSelectedBrands(brandIdsFromURL.map(Number));
        setSelectedCollections(collectionIdsFromURL.map(Number));
    }, [searchParams]);

    if (isLoading) {
        return <ComponentLoader className="h-96" />;
    }

    if (!data) {
        return <ServerError />;
    }

    const { products, ...pagination } = data;

    const handleManageCollections = () => {
        router.push("/admin/collections");
    };

    const handleManageBrands = () => {
        router.push("/admin/brands");
    };

    const getStatus = (variants: ProductVariant[] | undefined) => {
        if (!variants) return "Out of Stock";
        const variant = variants?.find((v) => v.inventory > 0);

        if (variant) {
            return "In Stock";
        }

        return "Out of Stock";
    };

    return (
        <div>
            <div className="hidden md:block">
                <ProductQuery brands={brands} collections={collections} selectedBrands={selectedBrands} selectedCollections={selectedCollections} />
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>S/N</TableHead>
                            <TableHead>Image</TableHead>
                            <TableHead>Product</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Variant</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow key="loading">
                                <TableCell className="text-center" colSpan={8}>
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : products?.length === 0 ? (
                            <TableRow key="no-orders">
                                <TableCell className="text-center" colSpan={8}>
                                    No products found
                                </TableCell>
                            </TableRow>
                        ) : (
                            products?.map((product: Product, idx: number) => (
                                <TableRow key={idx} className="transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted even:bg-content1">
                                    <TableCell className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-3">
                                        {pagination?.skip * LIMIT + idx + 1}
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap px-3 py-4 text-sm">
                                        <div className={cn("rounded-md overflow-hidden", product.active ? "" : "ring-2 ring-red-300")}>
                                            <Image
                                                alt={product.name}
                                                blurDataURL="/placeholder.jpg"
                                                className="w-full"
                                                height={40}
                                                placeholder="blur"
                                                src={
                                                    product.images?.sort((a, b) => a.order - b.order)?.[0]?.image ||
                                                    product?.image ||
                                                    "/placeholder.jpg"
                                                }
                                                width={40}
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell>{product.description}</TableCell>
                                    <TableCell>{product.variants?.length}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatus(product.variants) === "In Stock" ? "emerald" : "destructive"}>
                                            {getStatus(product.variants)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <ProductActions product={product} />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="md:hidden">
                <div className="py-4">
                    <ProductQuery
                        brands={brands}
                        collections={collections}
                        selectedBrands={selectedBrands}
                        selectedCollections={selectedCollections}
                    />

                    {(selectedCollections.length > 0 || selectedBrands.length > 0) && (
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
                            {selectedBrands.map((id: number, idx: number) => {
                                const brand = brands?.find((b: Brand) => b.id === id);

                                if (!brand) return null;

                                return (
                                    <div key={idx} className="bg-emerald-100 text-emerald-700 text-sm rounded-full px-3 py-1 flex items-center">
                                        <p>{brand.name}</p>
                                        <button
                                            className="ml-1"
                                            onClick={() => {
                                                setSelectedBrands(selectedBrands.filter((bId) => bId !== id));
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
                        <Button className="text-xs" size="sm" variant="outline" onClick={handleManageCollections}>
                            Collections
                        </Button>
                        <Button className="text-xs" size="sm" variant="outline" onClick={handleManageBrands}>
                            Brands
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        {products?.map((product: Product, idx: number) => (
                            <ProductListItem key={idx} actions={<ProductActions product={product} />} product={product} />
                        ))}
                    </div>

                    {isLoading && <ComponentLoader className="h-[300px]" />}

                    {products?.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-default-500">No products found</p>
                        </div>
                    )}
                </div>
            </div>
            {pagination && pagination.total_pages > 1 && <PaginationUI pagination={pagination!} range={1} />}
        </div>
    );
}
