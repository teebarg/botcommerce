import { createLazyFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useOverlayTriggerState } from "react-stately";
import { CatalogCard } from "@/components/admin/catalogs/catalog-card";
import { CatalogForm } from "@/components/admin/catalogs/catalog-form";
import type { DBCatalog } from "@/schemas";
import { Button } from "@/components/ui/button";
import SheetDrawer from "@/components/sheet-drawer";
import { useCatalogs } from "@/hooks/useCollection";
import EmptyState from "@/components/generic/empty";
import { PageLoader } from "@/components/generic/page-loader";

export const Route = createLazyFileRoute("/_adminLayout/admin/catalog")({
    component: RouteComponent,
});

function RouteComponent() {
    const state = useOverlayTriggerState({});
    const { data, isPending } = useCatalogs();

    return (
        <div className="px-3 py-2 slide-in">
            <div className="flex justify-between items-center mb-2">
                <h1 className="text-xl font-semibold">Catalogs</h1>
                <SheetDrawer
                    open={state.isOpen}
                    title="Add New Catalog"
                    trigger={
                        <Button size="sm" onClick={state.open}>
                            <Plus className="w-4 h-4" />
                            Add New
                        </Button>
                    }
                    onOpenChange={state.setOpen}
                >
                    <CatalogForm current={undefined} onClose={() => state.close()} />
                </SheetDrawer>
            </div>
            {isPending ? (
                <PageLoader variant="list" />
            ) : data?.catalogs?.length == 0 ? (
                <EmptyState
                    title="No catalogs available"
                    description="Click Add New below to create catalog"
                    action={
                        <Button className="mx-auto" onClick={state.open}>
                            <Plus className="w-4 h-4" />
                            Add New
                        </Button>
                    }
                />
            ) : (
                <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                    {data?.catalogs?.map((col: DBCatalog, idx: number) => (
                        <CatalogCard key={idx} catalog={col} />
                    ))}
                </div>
            )}
        </div>
    );
}
