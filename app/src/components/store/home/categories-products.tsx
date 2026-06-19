import { ChevronRight } from "lucide-react";
import { CategoriesWithProducts, ProductSearch } from "@/schemas";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/utils/api";
import ProductCardPLP from "../products/product-card-plp";
import { PageLoader } from "@/components/generic/page-loader";

export default function CategoriesWithProductsSection() {
    const { data, isLoading } = useQuery({
        queryKey: ["products", "home"],
        queryFn: () => api.get<CategoriesWithProducts[]>("/category/home/products"),
        staleTime: 1000 * 60 * 30,
        gcTime: 1000 * 60 * 60,
    });
    if (isLoading) return <PageLoader variant="grid" cols={4} rows={6} className="max-w-7xl w-full mx-auto py-2" />
    return (
        <section className="max-w-8xl mx-auto px-2 py-6 space-y-8">
            {data?.map((category: CategoriesWithProducts) => {
                if (category.products.length === 0) return null;

                return (
                    <div key={category.id} className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-display text-lg font-medium">{category.name}</h3>
                            <Link
                                to="/collections"
                                search={{ cat_ids: category.slug }}
                                className="flex items-center gap-1 text-sm text-accent font-medium"
                            >
                                View All
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                            {category.products.map((product: ProductSearch) => (
                                <ProductCardPLP key={product.id} product={product} />
                            ))}
                        </div>
                    </div>
                );
            })}
        </section>
    );
}
