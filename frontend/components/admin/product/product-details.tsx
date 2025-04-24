"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import ProductFilter from "./product-filter";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import PaginationUI from "@/components/pagination";
import { ProductActions } from "@/components/products/product-actions";
import { Brand, Category, Collection, Product } from "@/types/models";
import ProductListItem from "@/components/admin/product/product-list-item";
import { Button } from "@/components/ui/button";
import { useBrands, useCollections, useProducts } from "@/lib/hooks/useAdmin";
import { Skeleton } from "@/components/generic/skeleton";
import { useUpdateQuery } from "@/lib/hooks/useUpdateQuery";

const LIMIT = 10;

export function ProductDetails() {
    const router = useRouter();
    const { data, isLoading } = useProducts({ limit: LIMIT });
    const { data: collections } = useCollections();
    const { data: brands } = useBrands();
    const searchParams = useSearchParams();
    const { updateQuery } = useUpdateQuery(200);

    const [searchQuery, setSearchQuery] = useState<string>("");
    const [filterOpen, setFilterOpen] = useState<boolean>(false);
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

    if (!data) return null;

    const { products, ...pagination } = data;

    const filteredProducts = products?.filter((product) => product.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const handleApplyFilters = (collections: number[], brands: number[]) => {
        updateQuery([
            { key: "collections", value: collections.join(",") },
            { key: "brands", value: brands.join(",") },
        ]);
    };

    const handleManageCollections = () => {
        router.push("/collections");
    };

    const handleManageBrands = () => {
        router.push("/brands");
    };

    return (
        <div>
            <div className="hidden md:block">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>S/N</TableHead>
                            <TableHead>Image</TableHead>
                            <TableHead>Product</TableHead>
                            <TableHead>Sku</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Categories</TableHead>
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
                                    <img alt={product.name} className="w-10 h-10 rounded" src={product.image} />
                                </TableCell>
                                <TableCell className="font-medium">{product.name}</TableCell>
                                <TableCell>{product.sku}</TableCell>
                                <TableCell>{product.description}</TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-2 items-center">
                                        {product.categories?.map((category: Category, index: number) => (
                                            <Badge key={index} variant="secondary">
                                                {category.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell>{product.variants?.length}</TableCell>
                                <TableCell>
                                    <Badge variant={product.status === "IN_STOCK" ? "default" : "destructive"}>{product.status}</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <ProductActions product={product} />
                                </TableCell>
                            </motion.tr>
                        ))}
                    </TableBody>
                </Table>
                {pagination && <PaginationUI pagination={pagination!} />}
            </div>
            <div className="md:hidden">
                <div className="py-4">
                    <div className="relative mb-4">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="text-default-500" size={18} />
                        </div>
                        <input
                            className="pl-10 pr-12 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                            placeholder="Search products..."
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setFilterOpen(true)}>
                            <SlidersHorizontal className="text-default-500" size={18} />
                        </button>
                    </div>

                    {(selectedCollections.length > 0 || selectedBrands.length > 0) && (
                        <div className="mb-4 overflow-auto flex gap-2 flex-nowrap">
                            {selectedCollections.map((id, idx: number) => {
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
                            {selectedBrands.map((id, idx: number) => {
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
                        {filteredProducts?.map((product: Product, idx: number) => (
                            <ProductListItem key={idx} actions={<ProductActions product={product} />} product={product} />
                        ))}
                    </div>

                    {filteredProducts?.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No products found</p>
                        </div>
                    )}
                </div>

                <ProductFilter
                    brands={brands}
                    collections={collections}
                    open={filterOpen}
                    selectedBrands={selectedBrands}
                    selectedCollections={selectedCollections}
                    onApplyFilters={handleApplyFilters}
                    onOpenChange={setFilterOpen}
                />
            </div>
        </div>
    );
}
