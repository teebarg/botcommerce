import { Link } from "@tanstack/react-router";

import { useCategories } from "@/hooks/useCategories";
import type { Category } from "@/schemas/product";
import ComponentLoader from "@/components/component-loader";

const CategoriesSection: React.FC = () => {
    const { data: categories, isLoading } = useCategories();

    return (
        <div className="bg-linear-to-b from-background to-card/30">
            <div className="max-w-8xl mx-auto px-4 py-8 w-full text-left md:text-center">
                <h2 className="text-lg md:text-3xl font-bold mb-2 mt-6">Shop by category</h2>
                {isLoading ? (
                    <ComponentLoader className="h-48" />
                ) : (
                    <div className="flex overflow-x-auto pb-4 gap-5">
                        {(categories || []).map((category: Category, idx: number) => (
                            <Link
                                key={idx}
                                className="shrink-0 snap-start relative w-32 h-32 rounded-2xl overflow-hidden"
                                to={`/collections?cat_ids=${category.slug}`}
                            >
                                <img src={category.image || "/placeholder.jpg"} alt={category.name} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent flex items-end">
                                    <span className="text-sm font-semibold p-3 w-full text-center text-white">{category.name}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoriesSection;
