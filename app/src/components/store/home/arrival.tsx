import LocalizedClientLink from "@/components/ui/link";
import ProductsCarousel from "../product-carousel";

import { useProductSearch } from "@/hooks/useProduct";

export default function NewArrivals() {
    const { data, isLoading } = useProductSearch({ collections: "new-arrivals", limit: 10 });

    return (
        <div className="max-w-8xl mx-auto py-8 px-2">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg md:text-xl font-bold text-foreground">New Arrivals</h2>
                <LocalizedClientLink className="font-bold text-sm" href="/collections/new-arrivals">
                    View more
                </LocalizedClientLink>
            </div>
            <ProductsCarousel isLoading={isLoading} products={data?.products || []} />
        </div>
    );
}
