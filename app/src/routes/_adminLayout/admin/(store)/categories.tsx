import { createFileRoute } from "@tanstack/react-router";

import ServerError from "@/components/generic/server-error";
import { useCategories } from "@/hooks/useCategories";
import CategoryTree from "@/components/admin/categories/tree";
import type { Category } from "@/schemas/product";
import ComponentLoader from "@/components/component-loader";

export const Route = createFileRoute("/_adminLayout/admin/(store)/categories")({
    component: RouteComponent,
});

function RouteComponent() {
    const { data, isLoading, error } = useCategories();

    if (error) {
        return <ServerError />;
    }

    const categories = data?.filter((cat: Category) => !cat.parent_id);

    return (
        <div className="max-w-7xl w-full mx-auto">
            {isLoading ? <ComponentLoader className="h-[80vh]" /> : <CategoryTree data={categories} />}
        </div>
    );
}
