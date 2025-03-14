import { Metadata } from "next";
import React from "react";
import { Search } from "lucide-react";
import { ArrowUpDown } from "nui-react-icons";

import { siteConfig } from "@/lib/config";
import { api } from "@/apis";
import ServerError from "@/components/server-error";
import { Brand } from "@/lib/models";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import PaginationUI from "@/components/pagination";
import { Badge } from "@/components/ui/badge";
import { Actions } from "@/components/brand/brand-actions";
import { CreateBrand } from "@/components/brand/create-brand";

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

    const deleteBrand = async (id: number) => {
        "use server";
        await api.brand.delete(id);
    };

    return (
        <div className="px-2 py-2">
            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle>Brands</CardTitle>
                            <CardDescription>Manage your brands</CardDescription>
                        </div>
                        <div className="flex w-full items-center gap-2 sm:w-auto">
                            <div className="relative w-full sm:w-64">
                                <Input className="w-full" placeholder="Search brands..." startContent={<Search />} type="search" />
                            </div>
                            <CreateBrand />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
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
                            {brands.map((brand: Brand, idx: number) => (
                                <TableRow key={`${brand.id}-${idx}`} className="even:bg-content1">
                                    <TableCell>{(page - 1) * limit + idx + 1}</TableCell>
                                    <TableCell className="flex-1">
                                        <div className="font-bold truncate min-w-72">{brand?.name}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={brand.is_active ? "default" : "destructive"}>{brand.is_active ? "Active" : "Inactive"}</Badge>
                                    </TableCell>
                                    <TableCell>{new Date(brand.created_at as string).toLocaleDateString()}</TableCell>
                                    <TableCell className="flex justify-end">
                                        <Actions key={brand.id} deleteAction={deleteBrand} item={brand} />
                                    </TableCell>
                                </TableRow>
                            ))}
                            {brands?.length === 0 && (
                                <TableRow>
                                    <TableCell className="text-center py-4 text-lg text-default-500" colSpan={5}>
                                        No brands found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                    {/* Pagination */}
                    <PaginationUI pagination={pagination} />
                </CardContent>
            </Card>
        </div>
    );
}
