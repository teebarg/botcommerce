"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useOverlayTriggerState } from "@react-stately/overlays";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

import { ProductDetails } from "../admin/product/product-details";

import ProductUpload from "./product-upload";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DrawerUI from "@/components/drawer";
import { ProductView } from "@/components/products/product-view";
import { Button } from "@/components/ui/button";
import { api } from "@/apis";
import { useInvalidate } from "@/lib/hooks/useApi";

export function ProductInventory() {
    const addState = useOverlayTriggerState({});
    const [isExporting, setIsExporting] = useState<boolean>(false);
    const [isIndexing, setIsIndexing] = useState<boolean>(false);
    const invalidate = useInvalidate();

    const handleExport = async () => {
        setIsExporting(true);
        const { error } = await api.product.export();

        if (error) {
            toast.error(error);
            setIsExporting(false);

            return;
        }

        toast.success("Products exported successfully");
        setIsExporting(false);
    };

    const handleIndex = async () => {
        setIsIndexing(true);
        const { error } = await api.product.reIndex();

        if (error) {
            toast.error(error);
            setIsIndexing(false);

            return;
        }
        invalidate("products");
        invalidate("product-search");

        toast.success("Products indexed successfully");
        setIsIndexing(false);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Product Inventory</CardTitle>
                <CardDescription>Manage your product inventory and stock levels.</CardDescription>
            </CardHeader>
            <CardContent>
                <AnimatePresence>
                    <motion.div animate={{ opacity: 1 }} initial={{ opacity: 0 }} transition={{ duration: 0.5 }}>
                        <div className="max-w-[30rem] mb-8 w-full">
                            <ProductUpload />
                        </div>
                        <div className="flex gap-2">
                            <DrawerUI
                                open={addState.isOpen}
                                title={`Add Product`}
                                trigger={
                                    <span className="h-10 rounded-md mb-4 px-4 bg-primary text-white hover:bg-primary/90 inline-flex items-center text-sm font-medium transition-colors focus-visible:outline-none">
                                        Add Product
                                    </span>
                                }
                                onOpenChange={addState.setOpen}
                            >
                                <ProductView onClose={addState.close} />
                            </DrawerUI>
                            <Button disabled={isExporting} isLoading={isExporting} variant="outline" onClick={handleExport}>
                                <Download className="mr-2 h-4 w-4" /> Export Products
                            </Button>
                            <Button disabled={isIndexing} isLoading={isIndexing} variant="outline" onClick={handleIndex}>
                                Index
                            </Button>
                        </div>
                        {/* Product Details */}
                        <ProductDetails />
                    </motion.div>
                </AnimatePresence>
            </CardContent>
        </Card>
    );
}
