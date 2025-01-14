import { Metadata } from "next";
import { SiteConfig } from "types/global";
import React from "react";
import { Table } from "@modules/common/components/table";
import { getSiteConfigs } from "@lib/data";
import { Actions } from "@modules/admin/components/actions";
import { deleteSiteConfig } from "@modules/admin/actions";
import { SiteConfigForm } from "@/modules/admin/siteconfigs/siteconfigs-form";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
    title: `SiteConfigs | ${siteConfig.name} Store`,
    description: siteConfig.description,
};

export default async function SiteConfigsPage({ searchParams }: { searchParams: { search?: string; page?: string; limit?: string } }) {
    const search = searchParams.search || "";
    const page = parseInt(searchParams.page || "0", 10);
    const limit = parseInt(searchParams.limit || "20", 10);
    const { configs, ...pagination } = await getSiteConfigs(page, limit);

    return (
        <React.Fragment>
            <div>
                <div className="max-w-7xl mx-auto p-8">
                    <h1 className="text-2xl font-semibold mb-4">SiteConfigs</h1>
                    <Table
                        columns={["S/N", "Key", "Value", "Created At", "Actions"]}
                        form={<SiteConfigForm type="create" />}
                        pagination={pagination}
                        canSearch={false}
                    >
                        {configs
                            ?.sort((a: SiteConfig, b: SiteConfig) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                            .map((item: SiteConfig, index: number) => (
                                <tr key={item.id} className="even:bg-content2">
                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-3">{page * limit + index + 1}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                                        <div className="font-bold truncate max-w-32">{item?.key}</div>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                                        <div className="font-bold truncate max-w-32">{item?.value}</div>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                                        {new Date(item.created_at as string).toLocaleDateString()}
                                    </td>
                                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                                        <Actions
                                            label="config"
                                            deleteAction={deleteSiteConfig}
                                            form={<SiteConfigForm current={item} type="update" />}
                                            item={item}
                                            showDetails={false}
                                        />
                                    </td>
                                </tr>
                            ))}
                        {configs?.length === 0 && (
                            <tr>
                                <td className="text-center py-4 text-lg text-default-500" colSpan={5}>
                                    No configs found.
                                </td>
                            </tr>
                        )}
                    </Table>
                </div>
            </div>
        </React.Fragment>
    );
}
