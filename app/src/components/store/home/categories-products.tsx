import { ChevronRight } from "lucide-react";
import { CategoriesWithProducts, ProductSearch } from "@/schemas";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { clientApi } from "@/utils/api.client";
import ProductCardPLP from "../products/product-card-plp";

export default function CategoriesWithProductsSection() {
    const { data: categoriesWithProducts } = useQuery({
        queryKey: ["products", "home"],
        queryFn: () => clientApi.get<CategoriesWithProducts[]>("/category/home/products"),
    });
    return (
        <section className="max-w-8xl mx-auto px-4 py-6 space-y-8">
            <div>
                <h2 className="font-display text-xl font-semibold">Shop by Category</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Explore our collections</p>
            </div>

            {categoriesWithProducts?.map((category: CategoriesWithProducts, categoryIndex: number) => {
                if (category.products.length === 0) return null;

                return (
                    <div
                        key={category.id}
                        className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300"
                        style={{ animationDelay: `${categoryIndex * 100}ms` }}
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="font-display text-lg font-medium">{category.name}</h3>
                            <Link
                                to="/collections"
                                search={{ cat_ids: category.slug }}
                                className="flex items-center gap-1 text-sm text-primary font-medium"
                            >
                                View All
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
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
