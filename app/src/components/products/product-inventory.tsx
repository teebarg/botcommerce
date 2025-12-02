import { ProductDetails } from "@/components/admin/product/product-details";
import { Button } from "@/components/ui/button";
import { useBustCache, useFlushCache, useReIndexProducts } from "@/lib/hooks/useProduct";
import { useNavigate } from "@tanstack/react-router";

export function ProductInventory() {
    const reIndexProducts = useReIndexProducts();
    const bustCache = useBustCache();
    const flushCache = useFlushCache();
    const navigate = useNavigate();

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
                <p className="text-sm text-muted-foreground">Manage your product inventory and stock levels. Scroll down to load more products.</p>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
                <Button onClick={() => navigate({to: "/admin/products/create"})}>Create Product</Button>
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
