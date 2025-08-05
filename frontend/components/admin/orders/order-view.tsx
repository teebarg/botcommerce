"use client";

import React from "react";
import { AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { Search } from "lucide-react";

import OrderActions from "./order-actions";
import OrderFilters from "./order-filters";
import { OrderStatusBadge, PaymentStatusBadge } from "./order-status-badge";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Order } from "@/schemas";
import { currency } from "@/lib/utils";
import { useOrders } from "@/lib/hooks/useOrder";
import OrderCard from "@/components/admin/orders/order-card";
import { useUpdateQuery } from "@/lib/hooks/useUpdateQuery";
import PaginationUI from "@/components/pagination";
import { CardSkeleton } from "@/components/ui/skeletons";

const LIMIT = 10;

const OrderView: React.FC = () => {
    const { updateQuery } = useUpdateQuery(200);

    const searchParams = useSearchParams();

    const page = Number(searchParams.get("page")) || 1;
    const status = searchParams.get("status") || "";
    const start_date = searchParams.get("start_date") || "";
    const end_date = searchParams.get("end_date") || "";

    const filters = {
        status,
        start_date,
        end_date,
    };

    const { data, isLoading } = useOrders({
        skip: (page - 1) * LIMIT,
        take: LIMIT,
        ...filters,
    });

    const { orders, ...pagination } = data ?? { page: 0, limit: 0, total_pages: 0, total_count: 0 };

    return (
        <div className="px-4 md:px-10 py-8">
            <div className="mb-6 flex flex-col">
                <h1 className="text-2xl font-medium">Order view</h1>
                <p className="text-default-500 text-sm">Manage your orders.</p>
            </div>
            <AnimatePresence>
                <div key="table" className="md:block hidden">
                    <OrderFilters />
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Payment Status</TableHead>
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
                            ) : orders?.length === 0 ? (
                                <TableRow key="no-orders">
                                    <TableCell className="text-center" colSpan={6}>
                                        No orders found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                orders?.map((order: Order, idx: number) => (
                                    <TableRow key={idx}>
                                        <TableCell className="font-semibold">{order.order_number}</TableCell>
                                        <TableCell>{format(new Date(order.created_at), "MMM d, yyyy")}</TableCell>
                                        <TableCell>
                                            {order.user?.first_name} {order.user?.last_name}
                                        </TableCell>
                                        <TableCell>{currency(order.total)}</TableCell>
                                        <TableCell>
                                            <OrderStatusBadge status={order.status} />
                                        </TableCell>
                                        <TableCell>
                                            <PaymentStatusBadge status={order.payment_status} />
                                        </TableCell>
                                        <TableCell>
                                            <OrderActions order={order} />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div key="mobile" className="md:hidden">
                    <div className="pb-4">
                        <div className="relative mb-4">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="text-gray-400" size={18} />
                            </div>
                            <input
                                className="pl-10 pr-4 py-2 w-full border border-divider rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                placeholder="Search orders..."
                                type="text"
                                value={searchParams.get("search") ?? ""}
                                onChange={(e) => updateQuery([{ key: "search", value: e.target.value }])}
                            />
                        </div>

                        <OrderFilters />

                        <div>
                            {isLoading && <CardSkeleton showAvatar={false} />}
                            {orders?.map((order: Order, idx: number) => (
                                <OrderCard key={idx} actions={<OrderActions order={order} />} order={order} />
                            ))}

                            {orders?.length === 0 && (
                                <div className="text-center py-8">
                                    <p className="text-default-500">No orders found</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {pagination?.total_pages > 1 && <PaginationUI key="pagination" pagination={pagination} />}
            </AnimatePresence>
        </div>
    );
};

export default OrderView;
