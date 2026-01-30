import { TrendingUp } from "lucide-react";

import LocalizedClientLink from "@/components/ui/link";
import { useProductSearch } from "@/hooks/useProduct";
import ProductsCarousel from "@/components/store/product-carousel";

export default function Featured() {
    const { data, isLoading } = useProductSearch({ collections: "featured", limit: 10 });

    return (
        <div className="bg-linear-to-br from-yellow-50 to-orange-50 dark:from-background dark:to-secondary py-8 px-2">
            <div className="flex items-center justify-between md:px-12 mb-3">
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <h2 className="text-lg md:text-xl font-bold text-foreground">Featured</h2>
                </div>
                <LocalizedClientLink className="font-bold" href="/collections/featured">
                    View more
                </LocalizedClientLink>
            </div>
            <ProductsCarousel isLoading={isLoading} products={data?.products || []} />
        </div>
    );
}
