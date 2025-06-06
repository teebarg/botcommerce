"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { ProductQuery } from "./product-query";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import PaginationUI from "@/components/pagination";
import { ProductActions } from "@/components/admin/product/product-actions";
import { Brand, Collection, Product } from "@/types/models";
import ProductListItem from "@/components/admin/product/product-list-item";
import { Button } from "@/components/ui/button";
import { useBrands, useCollections, useProducts } from "@/lib/hooks/useApi";
import { Skeleton } from "@/components/generic/skeleton";
import ServerError from "@/components/generic/server-error";

const LIMIT = 10;

export function ProductDetails() {
    const router = useRouter();
    const { data: collections } = useCollections();
    const { data: brands } = useBrands();
    const searchParams = useSearchParams();
    const { data, isLoading } = useProducts({ limit: LIMIT, query: searchParams.get("search") || "", page: Number(searchParams.get("page")) });

    const [selectedCollections, setSelectedCollections] = useState<number[]>([]);
    const [selectedBrands, setSelectedBrands] = useState<number[]>([]);

    const brandIdsFromURL = searchParams.get("brands")?.split(",") || [];
    const collectionIdsFromURL = searchParams.get("collections")?.split(",") || [];

    useEffect(() => {
        setSelectedBrands(brandIdsFromURL.map(Number));
        setSelectedCollections(collectionIdsFromURL.map(Number));
    }, [searchParams]);

    if (isLoading)
        return (
            <div>
                <Skeleton className="h-40" />
            </div>
        );

    if (!data) return <ServerError />;

    const { products, ...pagination } = data;

    const handleManageCollections = () => {
        router.push("/admin/collections");
    };

    const handleManageBrands = () => {
        router.push("/admin/brands");
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
                            <TableHead>Sku</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Variant</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products?.map((product: Product, idx: number) => (
                            <motion.tr
                                key={idx}
                                animate={{ opacity: 1, y: 0 }}
                                className="transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted even:bg-content1"
                                initial={{ opacity: 0, y: 20 }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <TableCell className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-3">
                                    {(pagination?.page - 1) * LIMIT + idx + 1}
                                </TableCell>
                                <TableCell className="whitespace-nowrap px-3 py-4 text-sm">
                                    <img
                                        alt={product.name}
                                        className="w-10 h-10 rounded"
                                        src={product.images[0]?.image || product.image || "/placeholder.jpg"}
                                    />
                                </TableCell>
                                <TableCell className="font-medium">{product.name}</TableCell>
                                <TableCell>{product.sku}</TableCell>
                                <TableCell>{product.description}</TableCell>
                                <TableCell>{product.variants?.length}</TableCell>
                                <TableCell>
                                    <Badge variant={product.status === "IN_STOCK" ? "emerald" : "destructive"}>{product.status}</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <ProductActions product={product} />
                                </TableCell>
                            </motion.tr>
                        ))}
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
                        <div className="mb-4 overflow-auto flex gap-2 flex-nowrap">
                            {selectedCollections.map((id: number, idx: number) => {
                                const collection = collections?.find((c: Collection) => c.id === id);

                                if (!collection) return null;

                                return (
                                    <div key={idx} className="bg-primary/10 text-primary text-sm rounded-full px-3 py-1 flex items-center flex-1">
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
                                    <div key={idx} className="bg-gray-100 text-gray-700 text-sm rounded-full px-3 py-1 flex items-center flex-1">
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
