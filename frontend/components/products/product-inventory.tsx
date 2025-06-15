"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useOverlayTriggerState } from "@react-stately/overlays";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

import { ProductDetails } from "../admin/product/product-details";
import Overlay from "../overlay";

import ProductUpload from "./product-upload";

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
        <div className="px-2 py-8">
            <div className="mb-8">
                <h3 className="text-lg font-semibold">Product Inventory</h3>
                <p className="text-sm text-default-500">Manage your product inventory and stock levels.</p>
            </div>
            <AnimatePresence>
                <motion.div animate={{ opacity: 1 }} initial={{ opacity: 0 }} transition={{ duration: 0.5 }}>
                    <div className="max-w-120 mb-8 w-full">
                        <ProductUpload />
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                        <Overlay
                            open={addState.isOpen}
                            sheetClassName="min-w-[500px]"
                            title="Add Product"
                            trigger={<Button variant="primary">Add Product</Button>}
                            onOpenChange={addState.setOpen}
                        >
                            <ProductView onClose={addState.close} />
                        </Overlay>
                        <Button disabled={isExporting} isLoading={isExporting} variant="outline" onClick={handleExport}>
                            <Download className="mr-2 h-4 w-4" /> Export Products
                        </Button>
                        <Button className="min-w-32" disabled={isIndexing} isLoading={isIndexing} variant="outline" onClick={handleIndex}>
                            Re-index
                        </Button>
                    </div>
                    <ProductDetails />
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
