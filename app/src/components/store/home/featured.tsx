import LocalizedClientLink from "@/components/ui/link";
import { useProductSearch } from "@/hooks/useProduct";
import ProductsCarousel from "@/components/store/product-carousel";

export default function Featured() {
    const { data, isLoading } = useProductSearch({ collections: "featured", limit: 10 });

    return (
        <div className="max-w-[1400px] mx-auto py-8 px-2">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg md:text-xl font-bold text-foreground">Featured</h2>
                <LocalizedClientLink className="font-bold" href="/collections/featured">
                    View more
                </LocalizedClientLink>
            </div>
            <ProductsCarousel isLoading={isLoading} products={data?.products || []} />
        </div>
    );
}
