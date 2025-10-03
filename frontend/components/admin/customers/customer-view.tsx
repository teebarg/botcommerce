"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";

import CustomerFilter from "./customer-filter";
import CustomerCreateGuest from "./customer-create-guest";
import CustomerActions from "./customer-actions";
import CustomerCard from "./customer-card";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Order, Status, User } from "@/schemas";
import { useUsers } from "@/lib/hooks/useUser";
import { currency } from "@/lib/utils";
import { CardSkeleton } from "@/components/ui/skeletons";
import PaginationUI from "@/components/pagination";
import ClientOnly from "@/components/generic/client-only";

const LIMIT = 10;

const CustomerView: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [filterOpen, setFilterOpen] = useState<boolean>(false);

    const searchParams = useSearchParams();

    const page = Number(searchParams.get("page")) || 1;
    const status: Status = searchParams.get("status") as Status;

    const filters = {
        status,
    };

    const { data, isLoading } = useUsers({
        skip: (page - 1) * LIMIT,
        limit: LIMIT,
        ...filters,
    });

    const { users, ...pagination } = data ?? { skip: 0, limit: 0, total_pages: 0, total_count: 0 };

    const getStatusBadge = (status?: Status) => {
        const variants: Record<Status, "destructive" | "emerald" | "warning"> = {
            ["PENDING"]: "warning",
            ["ACTIVE"]: "emerald",
            ["INACTIVE"]: "destructive",
        };

        return <Badge variant={variants[status ?? "PENDING"]}>{status}</Badge>;
    };

    return (
        <ClientOnly>
            <div className="px-3 md:px-10 py-8">
                <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                        <h3 className="text-xl font-semibold">Customers view</h3>
                        <p className="text-sm text-muted-foreground">Manage your customers.</p>
                    </div>
                    <CustomerCreateGuest />
                </div>
                <>
                    <div key="table" className="md:block hidden bg-secondary">
                        <CustomerFilter open={filterOpen} onOpenChange={setFilterOpen} />
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>S/N</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Number of orders</TableHead>
                                    <TableHead>Total Spent</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow key="loading">
                                        <TableCell className="text-center" colSpan={6}>
                                            Loading...
                                        </TableCell>
                                    </TableRow>
                                ) : users?.length === 0 ? (
                                    <TableRow key="no-orders">
                                        <TableCell className="text-center" colSpan={6}>
                                            No users found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    users?.map((user: User, idx: number) => (
                                        <TableRow key={idx} className="odd:bg-background">
                                            <TableCell className="font-medium">{idx + 1}</TableCell>
                                            <TableCell>
                                                <div>
                                                    <p>
                                                        {user?.first_name} {user?.last_name}
                                                    </p>
                                                    <p className="text-muted-foreground">{user.email}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={user.role == "ADMIN" ? "secondary" : "default"}>{user.role}</Badge>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(user.status as Status)}</TableCell>
                                            <TableCell>{user.orders?.length}</TableCell>
                                            <TableCell>
                                                {currency(user.orders?.reduce((total: number, order: Order) => total + order.total, 0))}
                                            </TableCell>
                                            <TableCell>
                                                <CustomerActions user={user} />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="pb-4 md:hidden">
                        <div>
                            <div className="relative mb-4 bg-content1 rounded-md">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="text-muted-foreground" size={18} />
                                </div>
                                <input
                                    className="pl-10 pr-12 py-2 w-full border border-divider rounded-lg focus:outline-none"
                                    placeholder="Search customers..."
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <button className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setFilterOpen(true)}>
                                    <SlidersHorizontal className="text-muted-foreground" size={18} />
                                </button>
                            </div>
                            <div className="mt-4 py-2">
                                {users?.map((user: User, idx: number) => (
                                    <CustomerCard key={idx} actions={<CustomerActions user={user} />} user={user} />
                                ))}

                                {isLoading && <CardSkeleton showAvatar={false} />}
                            </div>

                            {users?.length === 0 && (
                                <div className="text-center py-10">
                                    <p className="text-muted-foreground">No users found</p>
                                </div>
                            )}
                        </div>

                        <CustomerFilter open={filterOpen} onOpenChange={setFilterOpen} />
                    </div>
                    {pagination?.total_pages > 1 && <PaginationUI key="pagination" pagination={pagination} />}
                </>
            </div>
        </ClientOnly>
    );
};

export default CustomerView;
