"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import { DateRange } from "react-day-picker";
import { Filter, Search } from "nui-react-icons";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { api } from "@/apis";
import { Order, OrderStatus } from "@/types/models";
import PaginationUI from "@/components/pagination";
import { currency } from "@/lib/util/util";

interface ProductInventoryProps {
    orders: Order[];
    pagination: {
        page: number;
        limit: number;
        total_count: number;
        total_pages: number;
    };
}

const OrderList: React.FC<ProductInventoryProps> = ({ orders, pagination }) => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [total, setTotal] = useState(0);
    const [filters, setFilters] = useState({
        status: "",
        search: "",
        start_date: "",
        end_date: "",
    });
    const [dateRange, setDateRange] = useState<DateRange | undefined>();

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const { data, error } = await api.order.query({
                skip: (page - 1) * limit,
                take: limit,
                ...filters,
            });

            if (error) {
                throw error;
            }
            setTotal(2000);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [page, filters, dateRange]);

    const handleStatusChange = async (orderId: number, newStatus: OrderStatus) => {
        try {
            // switch (newStatus) {
            //     case OrderStatus.CANCELLED:
            //         await orderApi.cancel(orderId);
            //         break;
            //     case OrderStatus.FULFILLED:
            //         await orderApi.fulfill(orderId);
            //         break;
            //     case OrderStatus.REFUNDED:
            //         await orderApi.refund(orderId);
            //         break;
            // }
            toast.success("Order status updated successfully");
            fetchOrders();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const getStatusBadge = (status?: OrderStatus) => {
        const variants: Record<OrderStatus, "outline" | "default" | "destructive" | "secondary"> = {
            ["PENDING"]: "outline",
            ["PROCESSING"]: "default",
            ["SHIPPED"]: "secondary",
            ["CANCELED"]: "destructive",
            ["DELIVERED"]: "default",
        };

        return <Badge variant={variants[status ?? "PENDING"]}>{status}</Badge>;
    };

    return (
        <div className="space-y-4">
            <Card className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                className="pl-8"
                                placeholder="Search orders..."
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                {/* <SelectItem value="">All Status</SelectItem> */}
                                {["PENDING", "PROCESSING", "FULFILLED", "CANCELED", "REFUNDED"].map((status) => (
                                    <SelectItem key={status} value={status}>
                                        {status}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <DateRangePicker className="w-[300px]" placeholder="Filter by date" value={dateRange} onChange={setDateRange} />
                        <Button variant="outline" onClick={() => setFilters({ status: "", search: "", start_date: "", end_date: "" })}>
                            <Filter className="h-4 w-4 mr-2" />
                            Clear Filters
                        </Button>
                    </div>
                </div>
            </Card>

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell className="text-center" colSpan={6}>
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : orders?.length === 0 ? (
                            <TableRow>
                                <TableCell className="text-center" colSpan={6}>
                                    No orders found
                                </TableCell>
                            </TableRow>
                        ) : (
                            orders?.map((order: Order, idx: number) => (
                                <TableRow key={idx}>
                                    <TableCell className="font-medium">{order.order_number}</TableCell>
                                    <TableCell>{format(new Date(order.created_at), "MMM d, yyyy")}</TableCell>
                                    <TableCell>
                                        {order.user?.first_name} {order.user?.last_name}
                                    </TableCell>
                                    <TableCell>{currency(order.total)}</TableCell>
                                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Button size="sm" variant="ghost" onClick={() => router.push(`/admin/orders/${order.order_number}`)}>
                                                View
                                            </Button>
                                            {order.status === "PENDING" && (
                                                <Button size="sm" variant="destructive" onClick={() => handleStatusChange(order.id, "CANCELED")}>
                                                    Cancel
                                                </Button>
                                            )}
                                            {order.status === "PROCESSING" && (
                                                <Button size="sm" variant="ghost" onClick={() => handleStatusChange(order.id, "DELIVERED")}>
                                                    Fulfill
                                                </Button>
                                            )}
                                            {order.status === "DELIVERED" && (
                                                <Button size="sm" variant="ghost" onClick={() => handleStatusChange(order.id, "CANCELED")}>
                                                    Refund
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>

            <PaginationUI pagination={pagination} />
        </div>
    );
};

export default OrderList;
