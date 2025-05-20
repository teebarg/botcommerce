"use client";

import { motion } from "framer-motion";
import { ShoppingCart, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import Link from "next/link";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useOrders } from "@/lib/hooks/useApi";
import { Order } from "@/types/models";
import { Skeleton } from "@/components/generic/skeleton";
import { currency } from "@/lib/util/util";
import { Badge } from "@/components/ui/badge";

// Function to render status badge
const OrderStatusBadge = ({ status }: { status: string }) => {
    const statusConfig: Record<string, { icon: JSX.Element; label: string; variant: "destructive" | "default" | "secondary" | "success" }> = {
        PAID: {
            icon: <CheckCircle className="mr-1" size={14} />,
            label: "Paid",
            variant: "success",
        },
        pending: {
            icon: <AlertTriangle className="mr-1" size={14} />,
            label: "Pending",
            variant: "destructive",
        },
        processing: {
            icon: <Clock className="mr-1" size={14} />,
            label: "Processing",
            variant: "default",
        },
        shipped: {
            icon: <ShoppingCart className="mr-1" size={14} />,
            label: "Shipped",
            variant: "secondary",
        },
        delivered: {
            icon: <CheckCircle className="mr-1" size={14} />,
            label: "Delivered",
            variant: "success",
        },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
        <Badge variant={config.variant}>
            {config.icon}
            {config.label}
        </Badge>
    );
};

const RecentOrdersList = () => {
    const { data, isLoading } = useOrders({ take: 5 });

    if (isLoading)
        return (
            <div className="mt-4 bg-background px-2 md:px-8 py-8 mx-4 rounded-xl">
                <Skeleton className="h-48" />
            </div>
        );

    const { orders } = data || {};

    if (orders?.length === 0) {
        return (
            <div className="mt-4 md:px-2 py-8 mx-4 rounded-xl">
                <p>No orders found!</p>
            </div>
        );
    }

    return (
        <div className="mt-4 md:px-2 py-8 mx-4 rounded-xl">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium">Recent Orders</h3>
                <Link className="text-sm font-medium text-primary" href="/admin/orders">
                    View all
                </Link>
            </div>
            <div className="hidden md:block bg-background py-6 px-2 rounded-xl">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>S/N</TableHead>
                            <TableHead>Order</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders?.map((order: Order, idx: number) => (
                            <motion.tr
                                key={idx}
                                animate={{ opacity: 1, y: 0 }}
                                className="transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted even:bg-content1"
                                initial={{ opacity: 0, y: 20 }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <TableCell className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-3">{idx + 1}</TableCell>
                                <TableCell className="whitespace-nowrap px-3 py-4 text-sm">{order.order_number}</TableCell>
                                <TableCell className="font-medium">
                                    {order.user.first_name} {order.user.last_name}
                                </TableCell>
                                <TableCell>{currency(order.total)}</TableCell>
                                <TableCell>{order.created_at}</TableCell>
                                <TableCell>
                                    <OrderStatusBadge status={order.status} />
                                </TableCell>
                            </motion.tr>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <div className="bg-background rounded-lg shadow-sm border border-gray-200 overflow-hidden md:hidden">
                <div className="divide-y divide-gray-200">
                    {orders?.map((order: Order, idx: number) => (
                        <div key={idx} className="p-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-medium">{order.order_number}</span>
                                <OrderStatusBadge status={order.status} />
                            </div>
                            <div className="flex justify-between text-sm text-default-500">
                                <span>
                                    {order.user.first_name} {order.user.last_name}
                                </span>
                                <span className="font-medium">{currency(order.total)}</span>
                            </div>
                            <div className="text-xs text-default-500 mt-1">{order.created_at}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RecentOrdersList;
