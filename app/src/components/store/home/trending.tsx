import { useProductSearch } from "@/hooks/useProduct";
import { ProductSearch } from "@/schemas";
import LocalizedClientLink from "@/components/ui/link";
import { TrendingUp } from "lucide-react";
import { Link } from "@tanstack/react-router";

export default function Trending() {
    const { data } = useProductSearch({ collections: "trending", limit: 6 });

    return (
        <div className="max-w-8xl mx-auto">
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
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 px-2">
                        {data?.products?.map((product: ProductSearch) => (
                            <Link key={product.id} to="/collections/$slug" params={{ slug: "trending" }} className="w-full h-full">
                                <img
                                    src={product.images?.[0] || "/placeholder.jpg"}
                                    alt={product.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
