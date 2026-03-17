import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpDown, Search } from "lucide-react";

import type { Collection } from "@/schemas/product";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { collectionsQuery } from "@/hooks/useCollection";
import ServerError from "@/components/generic/server-error";
import { CreateCollection } from "@/components/admin/collections/create-collection";
import { CollectionActions } from "@/components/admin/collections/collection-actions";
import CollectionItem from "@/components/admin/collections/collection-items";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/_adminLayout/admin/(store)/collections")({
    validateSearch: z.object({
        search: z.string().optional(),
    }),
    loaderDeps: ({ search }) => search,
    loader: async ({ context: { queryClient }, deps }) => {
        await queryClient.ensureQueryData(collectionsQuery(deps));
    },
    component: RouteComponent,
});

function RouteComponent() {
    const params = Route.useSearch();
    const { data: collections, error } = useQuery(collectionsQuery(params));

    if (error) {
        return <ServerError />;
    }

    return (
        <div className="px-3 md:px-10 py-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
                <div>
                    <h1 className="text-2xl font-medium">Collections</h1>
                    <p className="text-muted-foreground text-sm">Manage your collections</p>
                </div>
                <div className="flex w-full items-center gap-2 sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Input className="w-full bg-card" placeholder="Search collections..." startContent={<Search />} type="search" />
                    </div>
                    <CreateCollection />
                </div>
            </div>
            <div className="md:block hidden bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>S/N</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>
                                <div className="flex items-center gap-1">
                                    Created At
                                    <ArrowUpDown className="h-3 w-3" />
                                </div>
                            </TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {collections?.map((collection: Collection, idx: number) => (
                            <TableRow key={idx} className="odd:bg-background">
                                <TableCell>{idx + 1}</TableCell>
                                <TableCell className="flex-1">
                                    <div className="font-bold truncate min-w-72">{collection?.name}</div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={collection.is_active ? "emerald" : "destructive"}>
                                        {collection.is_active ? "Active" : "Inactive"}
                                    </Badge>
                                </TableCell>
                                <TableCell>{new Date(collection.created_at as string).toLocaleDateString()}</TableCell>
                                <TableCell className="flex justify-end">
                                    <CollectionActions collection={collection} />
                                </TableCell>
                            </TableRow>
                        ))}
                        {collections?.length === 0 && (
                            <TableRow>
                                <TableCell className="text-center py-4 text-lg text-muted-foreground" colSpan={5}>
                                    No collections found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="md:hidden">
                <div>
                    <div className="flex flex-col gap-3">
                        {collections?.map((collection: Collection, idx: number) => (
                            <CollectionItem key={idx} collection={collection} />
                        ))}
                    </div>

                    {collections?.length === 0 && (
                        <div className="text-center py-8 bg-background rounded-lg">
                            <p className="text-muted-foreground">No collections found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
