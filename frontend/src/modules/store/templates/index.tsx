import { Suspense } from "react";
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid";
import RefinementList from "@modules/store/components/refinement-list";
import { SortOptions } from "@modules/store/components/refinement-list/sort-products";

import PaginatedProducts from "./paginated-products";

const StoreTemplate = ({ sortBy, page, countryCode }: { sortBy?: SortOptions; page?: string; countryCode: string }) => {
    const pageNumber = page ? parseInt(page) : 1;

    return (
        <div className="flex flex-col sm:flex-row sm:items-start p-6 max-w-7xl mx-auto" data-testid="category-container">
            <RefinementList sortBy={sortBy || "created_at"} />
            <div className="w-full">
                <div className="mb-8 text-2xl">
                    <h1 data-testid="store-page-title">All products</h1>
                </div>
                <Suspense fallback={<SkeletonProductGrid />}>
                    <PaginatedProducts countryCode={countryCode} page={pageNumber} sortBy={sortBy || "created_at"} />
                </Suspense>
            </div>
        </div>
    );
};

export default StoreTemplate;
