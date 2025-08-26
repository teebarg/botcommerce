"use client";

import { Download } from "lucide-react";
import { useRouter } from "next/navigation";

import { ProductDetails } from "../admin/product/product-details";

import ProductUpload from "./product-upload";

import { Button } from "@/components/ui/button";
import { useBustCache, useExportProducts, useFlushCache, useReIndexProducts } from "@/lib/hooks/useProduct";

export function ProductInventory() {
    const exportProducts = useExportProducts();
    const reIndexProducts = useReIndexProducts();
    const bustCache = useBustCache();
    const flushCache = useFlushCache();
    const router = useRouter();

    const handleExport = () => {
        exportProducts.mutate();
    };

    const handleReIndex = () => {
        reIndexProducts.mutate();
    };

    const handleBustCache = () => {
        bustCache.mutate();
    };

    const handleFlushCache = () => {
        flushCache.mutate();
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
                <Button variant="primary" onClick={() => router.push("/admin/products/create")}>
                    Create Product
                </Button>
                <Button disabled={exportProducts.isPending} isLoading={exportProducts.isPending} variant="outline" onClick={handleExport}>
                    <Download className="mr-2 h-4 w-4" /> Export Products
                </Button>
                <Button
                    className="min-w-32"
                    disabled={reIndexProducts.isPending}
                    isLoading={reIndexProducts.isPending}
                    variant="emerald"
                    onClick={handleReIndex}
                >
                    Re-index
                </Button>
                <Button disabled={bustCache.isPending} isLoading={bustCache.isPending} variant="warning" onClick={handleBustCache}>
                    Bust Cache
                </Button>
                <Button disabled={flushCache.isPending} isLoading={flushCache.isPending} variant="destructive" onClick={handleFlushCache}>
                    Flush Cache
                </Button>
            </div>
            <ProductDetails />
        </div>
    );
}
