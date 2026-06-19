import { Link } from "@tanstack/react-router";
import { categoriesQuery } from "@/hooks/useCategories";
import type { Category } from "@/schemas/product";
import { useQuery } from "@tanstack/react-query";

function CategoryPillsSkeleton() {
    return (
        <>
            {Array.from({ length: 6 }).map((_, i) => (
                <div
                    key={i}
                    className="shrink-0 h-9 rounded-full bg-muted animate-pulse"
                    style={{ width: `${[64, 80, 72, 88, 68, 76][i]}px` }}
                />
            ))}
        </>
    );
}

export default function CategoriesSection() {
    const { data, isPending  } = useQuery(categoriesQuery());

    return (
        <div className="px-6 py-4 flex gap-2 overflow-x-auto md:flex-wrap md:overflow-visible max-w-8xl mx-auto">
            <Link
                to="/collections"
                className="shrink-0 px-4 py-2 rounded-full text-sm font-medium bg-foreground text-background"
            >
                All
            </Link>
            {isPending ? (
                <CategoryPillsSkeleton />
            ) : (
                (data || []).map((category: Category) => (
                    <Link
                        key={category.id}
                        to="/collections"
                        search={(prev: any) => ({ ...prev, cat_ids: category.slug })}
                        className="shrink-0 px-4 py-2 rounded-full text-sm font-medium border border-border text-foreground hover:bg-muted transition-colors"
                    >
                        {category.name}
                    </Link>
                ))
            )}
        </div>
    );
}