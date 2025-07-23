"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSharedCollections } from "@/lib/hooks/useCollection";
import ComponentLoader from "@/components/component-loader";
// import ServerError from "@/components/generic/server-error";
import { Shared } from "@/schemas";

export default function SharedCollectionList() {
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const { data, isLoading } = useSharedCollections();

    const handleDelete = async (id: number) => {
        // TODO: Implement delete functionality
    };


    if (isLoading) return <ComponentLoader />;

    return (
        <div className="space-y-4">
            {data?.shared?.length === 0 ? (
                <div>No shared collections found.</div>
            ) : (
                <table className="min-w-full border">
                    <thead>
                        <tr>
                            <th className="p-2 border">Title</th>
                            <th className="p-2 border">Slug</th>
                            <th className="p-2 border">Views</th>
                            <th className="p-2 border">Active</th>
                            <th className="p-2 border">Created</th>
                            <th className="p-2 border">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.shared?.map((col: Shared, idx: number) => (
                            <tr key={idx} className="border-b">
                                <td className="p-2 border">{col.title}</td>
                                <td className="p-2 border">{col.slug}</td>
                                <td className="p-2 border">{col.view_count}</td>
                                <td className="p-2 border">{col.is_active ? "Yes" : "No"}</td>
                                <td className="p-2 border">{new Date(col.created_at).toLocaleString()}</td>
                                <td className="p-2 border space-x-2">
                                    <Link href={`/admin/shared-collections/${col.id}/edit`}>
                                        <Button size="sm" variant="outline">
                                            Edit
                                        </Button>
                                    </Link>
                                    <Link href={`/shared-collections/${col.slug}`} target="_blank">
                                        <Button size="sm" variant="secondary">
                                            View
                                        </Button>
                                    </Link>
                                    <Button size="sm" variant="destructive" onClick={() => handleDelete(col.id)} disabled={deletingId === col.id}>
                                        {deletingId === col.id ? "Deleting..." : "Delete"}
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
