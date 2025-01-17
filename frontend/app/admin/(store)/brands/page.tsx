import { Metadata } from "next";
import { Brand } from "types/global";
import React from "react";
import { Table } from "@modules/common/components/table";
import { getBrands } from "@lib/data";
import { Actions } from "@modules/admin/components/actions";
import { Chip } from "@modules/common/components/chip";
import { deleteBrand } from "@modules/admin/actions";

import { BrandForm } from "@/modules/admin/brands/brand-form";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
    title: `Brands Page | Children clothing | ${siteConfig.name} Store`,
    description: siteConfig.description,
};

export default async function BrandsPage({ searchParams }: { searchParams: { search?: string; page?: string; limit?: string } }) {
    const search = searchParams.search || "";
    const page = parseInt(searchParams.page || "1", 10);
    const limit = parseInt(searchParams.limit || "10", 10);
    const { brands, ...pagination } = await getBrands(search, page, limit);

    return (
        <React.Fragment>
            <div className="bg-content2 h-full">
                <div className="max-w-7xl mx-auto p-8">
                    <h1 className="text-2xl font-semibold mb-4">Brands</h1>
                    <Table
                        columns={["S/N", "Name", "Status", "Created At", "Actions"]}
                        form={<BrandForm type="create" />}
                        pagination={pagination}
                        searchQuery={search}
                    >
                        {brands
                            ?.sort((a: Brand, b: Brand) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                            .map((item: Brand, index: number) => (
                                <tr key={item.id} className="even:bg-content2">
                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-3">{(page - 1) * limit + index + 1}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                                        <div className="font-bold truncate max-w-32">{item?.name}</div>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                                        <Chip color={item.is_active ? "success" : "danger"} title={item.is_active ? "Active" : "Inactive"} />
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                                        {new Date(item.created_at as string).toLocaleDateString()}
                                    </td>
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
