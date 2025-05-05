"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { useCategories } from "@/lib/hooks/useAdmin";
import { Category } from "@/types/models";
import { Skeleton } from "@/components/generic/skeleton";

const CategoriesSection: React.FC = () => {
    const { data: categories, isLoading } = useCategories();

    return (
        <section className="pt-6 md:pt-10">
            <div className="max-w-8xl mx-auto px-2 md:px-0">
                <h2 className="text-2xl font-bold text-commerce-primary mb-4 text-center">Shop by Category</h2>
                {isLoading ? (
                    <Skeleton className="h-48" />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {categories?.slice(0, 4)?.map((category: Category, idx: number) => (
                            <Link key={idx} className="group" href={`collections?cat_ids=${category.slug}`}>
                                <div className="relative h-48 rounded-lg overflow-hidden">
                                    <img
                                        alt={category.name}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                                        src={category.image}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                                        <div className="w-full flex items-center justify-between">
                                            <h3 className="text-xl font-semibold text-white">{category.name}</h3>
                                            <ChevronRight className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default CategoriesSection;
