"use client";

import React from "react";
import { ArrowUpDown, Search } from "nui-react-icons";

import { CreateCollection } from "./create-collection";
import { CollectionActions } from "./collection-actions";
import CollectionItem from "./collection-items";

import { Collection } from "@/types/models";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Props {
    collections: Collection[];
    deleteAction: (id: number) => void;
}

const CollectionView: React.FC<Props> = ({ collections, deleteAction }) => {
    return (
        <div className="px-2 md:px-10 py-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
                <div>
                    <h1 className="text-2xl font-semibold">Collections</h1>
                    <p className="text-muted-foreground">Manage your collections</p>
                </div>
                <div className="flex w-full items-center gap-2 sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Input className="w-full" placeholder="Search collections..." startContent={<Search />} type="search" />
                    </div>
                    <CreateCollection />
                </div>
            </div>
            <div className="md:block hidden">
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
                            <TableRow key={idx} className="even:bg-content1">
                                <TableCell>{idx + 1}</TableCell>
                                <TableCell className="flex-1">
                                    <div className="font-bold truncate min-w-72">{collection?.name}</div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={collection.is_active ? "success" : "destructive"}>
                                        {collection.is_active ? "Active" : "Inactive"}
                                    </Badge>
                                </TableCell>
                                <TableCell>{new Date(collection.created_at as string).toLocaleDateString()}</TableCell>
                                <TableCell className="flex justify-end">
                                    <CollectionActions collection={collection} deleteAction={deleteAction} />
                                </TableCell>
                            </TableRow>
                        ))}
                        {collections?.length === 0 && (
                            <TableRow>
                                <TableCell className="text-center py-4 text-lg text-default-500" colSpan={5}>
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
                            <CollectionItem key={idx} collection={collection} deleteAction={deleteAction} />
                        ))}
                    </div>

                    {collections?.length === 0 && (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                            <p className="text-gray-500">No collections found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CollectionView;
