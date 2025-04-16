"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOverlayTriggerState } from "@react-stately/overlays";

import ProductUpload from "./product-upload";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import PaginationUI from "@/components/pagination";
import DrawerUI from "@/components/drawer";
import { ProductView } from "@/components/products/product-view";
import { ProductActions } from "@/components/products/product-actions";
import { Brand, Category, Collection, Product } from "@/types/models";
import { useStore } from "@/app/store/use-store";

interface ProductInventoryProps {
    products: Product[];
    brands: Brand[];
    categories: Category[];
    collections: Collection[];
    pagination: {
        page: number;
        limit: number;
        total_count: number;
        total_pages: number;
    };
}

const LIMIT = 10;

export function ProductInventory({ brands, categories, collections, products, pagination }: ProductInventoryProps) {
    const addState = useOverlayTriggerState({});
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const { setCollections, setCategories, setBrands, setProducts } = useStore();

    useEffect(() => {
        setIsVisible(true);
        setCollections(collections);
        setCategories(categories);
        setBrands(brands);
        setProducts(products);
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Product Inventory</CardTitle>
                <CardDescription>Manage your product inventory and stock levels.</CardDescription>
            </CardHeader>
            <CardContent>
                <AnimatePresence>
                    {isVisible && (
                        <motion.div animate={{ opacity: 1 }} initial={{ opacity: 0 }} transition={{ duration: 0.5 }}>
                            <div className="max-w-[30rem] mb-8">
                                <ProductUpload />
                            </div>
                            <DrawerUI
                                direction="right"
                                open={addState.isOpen}
                                title={`Add Product`}
                                trigger={
                                    <span className="h-10 rounded-md px-8 mb-4 bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center text-sm font-medium transition-colors focus-visible:outline-none">
                                        Add Product
                                    </span>
                                }
                                onOpenChange={addState.setOpen}
                            >
                                <ProductView onClose={addState.close} />
                            </DrawerUI>
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
                                    {products.map((product: Product, index: number) => (
                                        <motion.tr
                                            key={product.id}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted even:bg-content1"
                                            initial={{ opacity: 0, y: 20 }}
                                            transition={{ delay: index * 0.1 }}
                                        >
                                            <TableCell className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-3">
                                                {(pagination.page - 1) * LIMIT + index + 1}
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
                            <PaginationUI pagination={pagination} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
}
