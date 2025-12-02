"use client";

import React from "react";
import { ArrowUpDown, Search } from "lucide-react";

import BrandItem from "./brand-item";

import ServerError from "@/components/generic/server-error";
import { Brand } from "@/schemas/product";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BrandActions } from "@/components/admin/brands/brand-actions";
import { CreateBrand } from "@/components/admin/brands/create-brand";
import { useBrands } from "@/lib/hooks/useBrand";
import { TableSkeleton } from "@/components/ui/skeletons";

const BrandView: React.FC = () => {
    const { data: brands, isLoading, error } = useBrands();

    if (error) {
        return <ServerError />;
    }

    if (isLoading) {
        return <TableSkeleton />;
    }

    return (
        <div className="px-2 md:px-10 py-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
                <div>
                    <h1 className="text-2xl font-medium">Brands</h1>
                    <p className="text-muted-foreground text-sm">Manage your brands</p>
                </div>
                <div className="flex w-full items-center gap-2 sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Input className="w-full" placeholder="Search brands..." startContent={<Search />} type="search" />
                    </div>
                    <CreateBrand />
                </div>
            </div>
            <div className="md:block hidden bg-secondary rounded p-4">
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
                        {brands?.map((brand: Brand, idx: number) => (
                            <TableRow key={idx} className="odd:bg-background">
                                <TableCell>{idx + 1}</TableCell>
                                <TableCell className="flex-1">
                                    <div className="font-bold truncate min-w-72">{brand?.name}</div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={brand.is_active ? "emerald" : "destructive"}>{brand.is_active ? "Active" : "Inactive"}</Badge>
                                </TableCell>
                                <TableCell>{new Date(brand.created_at as string).toLocaleDateString()}</TableCell>
                                <TableCell className="flex justify-end">
                                    <BrandActions key={brand.id} item={brand} />
                                </TableCell>
                            </TableRow>
                        ))}
                        {brands?.length === 0 && (
                            <TableRow>
                                <TableCell className="text-center py-4 text-lg text-muted-foreground" colSpan={5}>
                                    No brands found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="md:hidden">
                <div>
                    <div className="flex flex-col gap-3">
                        {brands?.map((brand: Brand, idx: number) => (
                            <BrandItem key={idx} brand={brand} />
                        ))}
                    </div>

                    {brands?.length === 0 && (
                        <div className="text-center py-8 bg-secondary rounded-lg">
                            <p>No brands found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BrandView;
