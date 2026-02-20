import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useOverlayTriggerState } from "react-stately";
import { CatalogCard } from "@/components/admin/catalogs/catalog-card";
import { CatalogForm } from "@/components/admin/catalogs/catalog-form";
import ComponentLoader from "@/components/component-loader";
import type { DBCatalog } from "@/schemas";
import { Button } from "@/components/ui/button";
import { useCatalogs } from "@/hooks/useCollection";
import SheetDrawer from "@/components/sheet-drawer";

export const Route = createFileRoute("/_adminLayout/admin/catalog")({
    component: RouteComponent,
});

function RouteComponent() {
    const state = useOverlayTriggerState({});
    const { data, isLoading } = useCatalogs();

    if (isLoading) return <ComponentLoader className="h-[400px]" />;
    return (
        <div className="p-4">
            <div>
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
        </div>
    );
}
