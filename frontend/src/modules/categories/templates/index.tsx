import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductCategoryWithChildren } from "types/global";
import InteractiveLink from "@modules/common/components/interactive-link";
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid";
import RefinementList from "@modules/store/components/refinement-list";
import { SortOptions } from "@modules/store/components/refinement-list/sort-products";
import PaginatedProducts from "@modules/store/templates/paginated-products";
import LocalizedClientLink from "@modules/common/components/localized-client-link";

export default function CategoryTemplate({
    categories,
    sortBy,
    page,
    countryCode,
}: {
    categories: ProductCategoryWithChildren[];
    sortBy?: SortOptions;
    page?: string;
    countryCode: string;
}) {
    const pageNumber = page ? parseInt(page) : 1;

    const category = categories[categories.length - 1];
    const parents = categories.slice(0, categories.length - 1);

    if (!category || !countryCode) notFound();

    return (
        <div className="flex flex-col sm:flex-row sm:items-start p-6 max-w-7xl mx-auto" data-testid="category-container">
            <RefinementList data-testid="sort-by-container" sortBy={sortBy || "created_at"} />
            <div className="w-full">
                <div className="flex flex-row mb-8 text-2xl-semi gap-4">
                    {parents &&
                        parents.map((parent) => (
                            <span key={parent.id} className="text-default-500">
                                <LocalizedClientLink
                                    className="mr-4 hover:text-black"
                                    data-testid="sort-by-link"
                                    href={`/categories/${parent.slug}`}
                                >
                                    {parent.name}
                                </LocalizedClientLink>
                                /
                            </span>
                        ))}
                    <h1 data-testid="category-page-title">{category.name}</h1>
                </div>
                {category.description && (
                    <div className="mb-8 text-base">
                        <p>{category.description}</p>
                    </div>
                )}
                {category.category_children && (
                    <div className="mb-8 text-base">
                        <ul className="grid grid-cols-1 gap-2">
                            {category.category_children?.map((c) => (
                                <li key={c.id}>
                                    <InteractiveLink href={`/categories/${c.slug}`}>{c.name}</InteractiveLink>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                <Suspense fallback={<SkeletonProductGrid />}>
                    <PaginatedProducts categoryId={category.id} countryCode={countryCode} page={pageNumber} sortBy={sortBy || "created_at"} />
                </Suspense>
            </div>
        </div>
    );
}
