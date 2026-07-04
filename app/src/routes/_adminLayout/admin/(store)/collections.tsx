import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import type { Collection } from "@/schemas/product";
import { Input } from "@/components/ui/input";
import { useCollections } from "@/hooks/useCollection";
import ServerError from "@/components/generic/server-error";
import { CreateCollection } from "@/components/admin/collections/create-collection";
import CollectionItem from "@/components/admin/collections/collection-items";
import { z } from "zod";
import { PageLoader } from "@/components/generic/page-loader";
import EmptyState from "@/components/generic/empty";

export const Route = createFileRoute("/_adminLayout/admin/(store)/collections")({
    validateSearch: z.object({
        search: z.string().optional(),
    }),
    component: RouteComponent,
});

function RouteComponent() {
    const params = Route.useSearch();
    const { data: collections, isPending, error } = useCollections(params);

    if (error) return <ServerError error={error.message} stack={error.stack} scenario="admin collections" />;

    return (
        <div className="px-2 py-2 max-w-4xl">
            <div>
                <h1 className="text-xl font-medium">Collections</h1>
                <p className="text-muted-foreground text-sm">Manage your collections</p>
            </div>
            <div className="sticky flex items-center gap-2 glass top-[calc(var(--sat)+var(--admin-nav-height))] -mx-2 z-40 p-2">
                <div className="relative w-full sm:w-64">
                    <Input className="w-full bg-card" placeholder="Search collections..." startContent={<Search />} type="search" />
                </div>
                <CreateCollection />
            </div>
            <div className="space-y-2.5">
                {isPending ? (
                    <PageLoader variant="list" />
                ) : collections.length > 0 ? collections?.map((collection: Collection, idx: number) => (
                    <CollectionItem key={idx} collection={collection} />
                )) : (
                    <EmptyState title="No collections found" description="No collections created yet" />
                )}
            </div>
        </div>
    );
}
