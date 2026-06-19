import { createFileRoute } from "@tanstack/react-router";
import ServerError from "@/components/generic/server-error";
import { useCategories } from "@/hooks/useCategories";
import CategoryTree from "@/components/admin/categories/tree";
import { PageLoader } from "@/components/generic/page-loader";

export const Route = createFileRoute("/_adminLayout/admin/(store)/categories")({
    component: RouteComponent,
});

function RouteComponent() {
    const { data, error, isLoading } = useCategories();

    if (error) return <ServerError />;
    if (isLoading) return <PageLoader variant="list" rows={6} className="max-w-7xl w-full mx-auto py-2" />;

    return (
        <div className="max-w-7xl w-full mx-auto py-2">
            <CategoryTree data={data} />
        </div>
    );
}
