import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useOverlayTriggerState } from "react-stately";
import { CatalogCard } from "@/components/admin/catalogs/catalog-card";
import { CatalogForm } from "@/components/admin/catalogs/catalog-form";
import type { DBCatalog } from "@/schemas";
import { Button } from "@/components/ui/button";
import SheetDrawer from "@/components/sheet-drawer";
import { catalogsQuery, useCatalogs } from "@/hooks/useCollection";

export const Route = createFileRoute("/_adminLayout/admin/catalog")({
    loader: async ({ context: { queryClient } }) => {
        await queryClient.ensureQueryData(catalogsQuery());
    },
    component: RouteComponent,
});

function RouteComponent() {
    const state = useOverlayTriggerState({});
    const { data } = useCatalogs();

    return (
        <div className="py-8 px-3">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Catalogs</h1>
                <SheetDrawer
                    open={state.isOpen}
                    title="Add New Catalog"
                    trigger={
                        <Button onClick={state.open}>
                            <Plus className="w-4 h-4" />
                            Add New
                        </Button>
                    }
                    onOpenChange={state.setOpen}
                >
                    <CatalogForm current={undefined} onClose={() => state.close()} />
                </SheetDrawer>
            </div>
            {data?.catalogs?.length === 0 ? (
                <div>No Catalogs found.</div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {data?.catalogs?.map((col: DBCatalog, idx: number) => (
                        <CatalogCard key={idx} catalog={col} />
                    ))}
                </div>
            )}
        </div>
    );
}
