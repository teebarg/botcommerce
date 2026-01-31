import { useProductSearch } from "@/hooks/useProduct";
import { ProductSearch } from "@/schemas";
import ProductCard from "../products/product-card";
import LocalizedClientLink from "@/components/ui/link";
import { TrendingUp } from "lucide-react";

export default function Trending() {
    const { data, isLoading } = useProductSearch({ collections: "trending", limit: 6 });

    return (
        <div className="max-w-[1400px] mx-auto">
            {data?.products?.length && data?.products?.length > 0 && (
                <section className="py-8 px-2">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            <h2 className="text-lg md:text-xl font-bold text-foreground">Trending Now</h2>
                        </div>
                        <LocalizedClientLink className="text-sm" href="/collections/trending">
                            View All
                        </LocalizedClientLink>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
                        {data?.products?.map((product: ProductSearch, idx: number) => (
                            <ProductCard product={product} variant="electric" index={idx} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
