import { useProductSearch } from "@/hooks/useProduct";
import { ProductSearch } from "@/schemas";
import ProductCard from "../products/product-card";
import LocalizedClientLink from "@/components/ui/link";

export default function Trending() {
    const { data, isLoading } = useProductSearch({ collections: "trending", limit: 6 });

    return (
        <div className="md:px-6">
            {data?.products?.length && data?.products?.length > 0 && (
                <section className="py-8 px-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold">Trending Now</h2>
                        <LocalizedClientLink className="text-sm" href="/collections/trending">
                            View All
                        </LocalizedClientLink>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {data?.products?.map((product: ProductSearch) => (
                            <ProductCard product={product} variant="electric" />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
