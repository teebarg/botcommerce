import { CategoriesWithProducts } from "@/server/categories.server";
import { ChevronRight } from "lucide-react";
import { ProductSearch } from "@/schemas";
import ProductCardLight from "../products/product-card-light";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { clientApi } from "@/utils/api.client";
import { useQuery } from "@tanstack/react-query";

export default function CategoriesWithProductsSection() {
    const { data: categoriesWithProducts } = useQuery({
        queryKey: ["products", "home"],
        queryFn: async () => await clientApi.get<CategoriesWithProducts[]>("/category/home/products"),
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
                    <motion.div
                        key={category.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: categoryIndex * 0.1 }}
                        viewport={{ once: true }}
                        className="space-y-4"
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="font-display text-lg font-medium">{category.name}</h3>
                            <Link
                                to="/collections"
                                search={(prev) => ({ ...prev, cat_ids: category.slug })}
                                className="flex items-center gap-1 text-sm text-primary font-medium"
                            >
                                View All
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                            {category.products.map((product: ProductSearch, index: number) => (
                                <ProductCardLight key={product.id} product={product} index={index} />
                            ))}
                        </div>
                    </motion.div>
                );
            })}
        </section>
    );
}
