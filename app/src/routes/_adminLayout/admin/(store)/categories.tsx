import { createFileRoute } from "@tanstack/react-router";
import ServerError from "@/components/generic/server-error";
import { categoriesQuery } from "@/hooks/useCategories";
import CategoryTree from "@/components/admin/categories/tree";
import type { Category } from "@/schemas/product";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/_adminLayout/admin/(store)/categories")({
    loader: async ({ context: { queryClient } }) => {
        await queryClient.ensureQueryData(categoriesQuery());
    },
    component: RouteComponent,
});

function RouteComponent() {
    const { data, error } = useQuery(categoriesQuery());

    if (error) {
        return <ServerError />;
    }

    const categories = data?.filter((cat: Category) => !cat.parent_id);

    return (
        <div className="max-w-7xl w-full mx-auto">
            <CategoryTree data={categories} />
        </div>
    );
}
