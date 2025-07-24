"use client";

import { useOverlayTriggerState } from "@react-stately/overlays";
import { Download } from "lucide-react";

import { ProductDetails } from "../admin/product/product-details";

import ProductUpload from "./product-upload";

import Overlay from "@/components/overlay";
import { ProductView } from "@/components/products/product-view";
import { Button } from "@/components/ui/button";
import { useExportProducts, useReIndexProducts } from "@/lib/hooks/useProduct";

export function ProductInventory() {
    const addState = useOverlayTriggerState({});

    const exportProducts = useExportProducts();
    const reIndexProducts = useReIndexProducts();

    const handleExport = () => {
        exportProducts.mutate();
    };

    const handleReIndex = () => {
        reIndexProducts.mutate();
    };

    return (
        <div className="px-4 py-8 overflow-y-auto">
            <div className="mb-8">
                <h3 className="text-lg font-semibold">Product Inventory</h3>
                <p className="text-sm text-default-500">Manage your product inventory and stock levels.</p>
            </div>
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
                <Button disabled={exportProducts.isPending} isLoading={exportProducts.isPending} variant="outline" onClick={handleExport}>
                    <Download className="mr-2 h-4 w-4" /> Export Products
                </Button>
                <Button
                    className="min-w-32"
                    disabled={reIndexProducts.isPending}
                    isLoading={reIndexProducts.isPending}
                    variant="outline"
                    onClick={handleReIndex}
                >
                    Re-index
                </Button>
            </div>
            <ProductDetails />
        </div>
    );
}
