"use client";

import Link from "next/link";

import { useCategories } from "@/lib/hooks/useApi";
import { Category } from "@/schemas/product";
import { Skeleton } from "@/components/ui/skeletons";

const CategoriesSection: React.FC = () => {
    const { data: categories, isLoading } = useCategories();

    if (!categories?.length) {
        return null;
    }

    if (isLoading) {
        return (
            <div className="max-w-8xl mx-auto w-full mt-4">
                <Skeleton className="h-48" />
            </div>
        );
    }

    return (
        <div className="max-w-8xl mx-auto bg-content1 p-4 w-full">
            <h2 className="text-2xl font-bold text-center mb-8">Shop by category</h2>

            <div className="flex overflow-x-auto pb-4 gap-5 md:hidden">
                {categories?.map((category: Category, idx: number) => (
                    <Link key={idx} className="flex flex-col items-center min-w-max" href={`/collections?cat_ids=${category.slug}`}>
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-2 overflow-hidden`}>
                            <img alt={category.name} className="w-full h-full object-cover" src={category.image || "/placeholder.jpg"} />
                        </div>
                        <span className="text-base font-medium">{category.name}</span>
                    </Link>
                ))}
            </div>

            <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-6 gap-6 justify-items-center">
                {categories?.slice(0, 6).map((category: Category, idx: number) => (
                    <Link key={idx} className="flex flex-col items-center" href={`/collections?cat_ids=${category.slug}`}>
                        <div
                            className={`w-32 h-32 lg:w-40 lg:h-40 rounded-full flex items-center justify-center mb-3 overflow-hidden transition-transform hover:scale-105`}
                        >
                            <img alt={category.name} className="w-full h-full object-cover" src={category.image || "/placeholder.jpg"} />
                        </div>
                        <span className="text-lg font-medium">{category.name}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default CategoriesSection;
