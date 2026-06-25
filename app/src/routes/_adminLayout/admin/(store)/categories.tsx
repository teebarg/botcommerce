import { createFileRoute } from "@tanstack/react-router";
import ServerError from "@/components/generic/server-error";
import { useCategories } from "@/hooks/useCategories";
import CategoryTree from "@/components/admin/categories/tree";

export const Route = createFileRoute("/_adminLayout/admin/(store)/categories")({
    component: RouteComponent,
});

function RouteComponent() {
    const { data, error, isPending } = useCategories();

    if (error) return <ServerError error={error.message} stack={error.stack} scenario="admin categories" />;

    return (
        <CategoryTree data={data} isPending={isPending} />
    );
}
