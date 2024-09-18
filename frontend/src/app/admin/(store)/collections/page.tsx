import { Metadata } from "next";
import { Collection, Product } from "types/global";
import React from "react";
import { Table } from "@modules/common/components/table";
import ProductUpload from "@modules/admin/products/product-upload";
import { getCollectionsList } from "@lib/data";
import { Actions } from "@modules/admin/components/actions";
import { CollectionForm } from "@modules/admin/collections/collection-form";
import { Chip } from "@modules/common/components/chip";
import { deleteCollection } from "@modules/admin/actions";

export const metadata: Metadata = {
    title: "Children clothing | TBO Store",
    description: "A performant frontend ecommerce starter template with Next.js.",
};

export default async function CollectionsPage({ searchParams }: { searchParams: { search?: string; page?: string; limit?: string } }) {
    const search = searchParams.search || "";
    const page = parseInt(searchParams.page || "1", 10);
    const limit = parseInt(searchParams.limit || "10", 10);
    const { collections, ...pagination } = await getCollectionsList(search, page, limit);

    return (
        <React.Fragment>
            <div>
                <div className="max-w-7xl mx-auto p-8">
                    <h1 className="text-2xl font-semibold mb-2">Products</h1>
                    <div className="py-4">
                        <ProductUpload />
                    </div>
                    <Table
                        form={<CollectionForm type="create" />}
                        columns={["S/N", "Name", "Status", "Created At", "Actions"]}
                        pagination={pagination}
                        canExport
                        canIndex
                        searchQuery={search}
                    >
                        {collections
                            ?.sort((a: Collection, b: Collection) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                            .map((item: Product, index: number) => (
                                <tr key={item.id} className="even:bg-content2">
                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-3">{(page - 1) * limit + index + 1}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                                        <div className="font-bold truncate max-w-32">{item?.name}</div>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                                        <Chip title={item.is_active ? "Active" : "Inactive"} color={item.is_active ? "success" : "danger"} />
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                                        {new Date(item.created_at as string).toLocaleDateString()}
                                    </td>
                                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                                        <Actions item={item} form={<CollectionForm type="update" current={item} />} deleteAction={deleteCollection} />
                                    </td>
                                </tr>
                            ))}
                        {collections?.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center py-4 text-lg text-default-500">
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
