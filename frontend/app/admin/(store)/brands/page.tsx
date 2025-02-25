import { Metadata } from "next";
import React from "react";
import { Table } from "@modules/common/components/table";
import { Actions } from "@modules/admin/components/actions";

import { BrandForm } from "@/modules/admin/brands/brand-form";
import { siteConfig } from "@/lib/config";
import Chip from "@/components/ui/chip";
import { api } from "@/apis";
import ServerError from "@/components/server-error";
import { Brand } from "@/lib/models";

export const metadata: Metadata = {
    title: `Brands Page | Children clothing | ${siteConfig.name} Store`,
    description: siteConfig.description,
};

type SearchParams = Promise<{
    page?: string;
    limit?: string;
    search?: string;
}>;

export default async function BrandsPage(props: { searchParams: SearchParams }) {
    const searchParams = await props.searchParams;
    const search = searchParams.search || "";
    const page = parseInt(searchParams.page || "1", 10);
    const limit = parseInt(searchParams.limit || "10", 10);
    const res = await api.brand.all({ search, page, limit });

    if (!res) {
        return <ServerError />;
    }
    const { brands, ...pagination } = res;

    const deleteBrand = async (id: string) => {
        "use server";
        await api.brand.delete(id);
    };

    return (
        <React.Fragment>
            <div className="h-full">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-2xl font-semibold mb-8">Brands</h1>
                    <Table
                        columns={["S/N", "Name", "Status", "Created At", "Actions"]}
                        form={<BrandForm type="create" />}
                        pagination={pagination}
                        searchQuery={search}
                    >
                        {brands.map((item: Brand, index: number) => (
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
                                        deleteAction={deleteBrand}
                                        form={<BrandForm current={item} type="update" />}
                                        item={item}
                                        label="brand"
                                        showDetails={false}
                                    />
                                </td>
                            </tr>
                        ))}
                        {brands?.length === 0 && (
                            <tr>
                                <td className="text-center py-4 text-lg text-default-500" colSpan={5}>
                                    No brands found.
                                </td>
                            </tr>
                        )}
                    </Table>
                </div>
            </div>
        </React.Fragment>
    );
}
