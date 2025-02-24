import { Metadata } from "next";
import React from "react";
import { Table } from "@modules/common/components/table";
import ProductUpload from "@modules/admin/products/product-upload";
import { Actions } from "@modules/admin/components/actions";
import { CollectionForm } from "@modules/admin/collections/collection-form";
import { deleteCollection } from "@modules/admin/actions";

import { siteConfig } from "@/lib/config";
import Chip from "@/components/ui/chip";
import { api } from "@/api";
import { Collection } from "@/lib/models";
import ServerError from "@/components/server-error";

export const metadata: Metadata = {
    title: `Children clothing | ${siteConfig.name} Store`,
    description: siteConfig.description,
};

type SearchParams = Promise<{
    page?: string;
    limit?: string;
    search?: string;
}>;

export default async function CollectionsPage(props: { searchParams: SearchParams }) {
    const searchParams = await props.searchParams;
    const search = searchParams.search || "";
    const page = parseInt(searchParams.page || "1", 10);
    const limit = parseInt(searchParams.limit || "10", 10);
    const res = await api.collection.all({ search, page, limit });

    if (!res) {
        return <ServerError />;
    }
    const { collections, ...pagination } = res;
    const customer = await api.user.me();

    return (
        <React.Fragment>
            <div>
                <div className="max-w-7xl mx-auto p-8">
                    <h1 className="text-2xl font-semibold mb-2">Collections</h1>
                    <div className="py-4">
                        <ProductUpload userId={customer.id} />
                    </div>
                    <Table
                        canExport
                        columns={["S/N", "Name", "Status", "Created At", "Actions"]}
                        form={<CollectionForm type="create" />}
                        pagination={pagination}
                        searchQuery={search}
                    >
                        {collections.map((item: Collection, index: number) => (
                            <tr key={item.id} className="even:bg-content2">
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-3">{(page - 1) * limit + index + 1}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm">
                                    <div className="font-bold truncate max-w-32">{item?.name}</div>
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm">
                                    <Chip color={item.is_active ? "success" : "danger"} title={item.is_active ? "Active" : "Inactive"} />
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm">{new Date(item.created_at as string).toLocaleDateString()}</td>
                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                                    <Actions
                                        deleteAction={deleteCollection}
                                        form={<CollectionForm current={item} type="update" />}
                                        item={item}
                                        label="collection"
                                    />
                                </td>
                            </tr>
                        ))}
                        {collections?.length === 0 && (
                            <tr>
                                <td className="text-center py-4 text-lg text-default-500" colSpan={5}>
                                    No collections found.
                                </td>
                            </tr>
                        )}
                    </Table>
                </div>
            </div>
        </React.Fragment>
    );
}
