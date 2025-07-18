"use client";

import { motion } from "framer-motion";
import { ShoppingCart, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import Link from "next/link";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useOrders } from "@/lib/hooks/useOrder";
import { Order } from "@/schemas";
import { currency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import ComponentLoader from "@/components/component-loader";
import ClientOnly from "@/components/generic/client-only";
import ServerError from "@/components/generic/server-error";

const OrderStatusBadge = ({ status }: { status: string }) => {
    const statusConfig: Record<string, { icon: JSX.Element; label: string; variant: "destructive" | "default" | "secondary" | "emerald" }> = {
        PAID: {
            icon: <CheckCircle className="mr-1" size={14} />,
            label: "Paid",
            variant: "emerald",
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
            variant: "emerald",
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
    const { data, isLoading, error } = useOrders({ take: 5 });

    if (isLoading)
        return (
            <ClientOnly>
                <div className="px-2 md:px-10">
                    <ComponentLoader className="h-100" />
                </div>
            </ClientOnly>
        );

    if (error) {
        return <ServerError />;
    }

    const { orders } = data || { orders: [] };

    if (!orders) {
        return (
            <div className="px-2 md:px-10 py-8">
                <p>No orders found!</p>
            </div>
        );
    }

    return (
        <div className="px-2 md:px-10 py-8">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium">Recent Orders</h3>
                <Link className="text-sm font-medium text-primary hover:underline" href="/admin/orders">
                    View all
                </Link>
            </div>
            <div className="hidden md:block py-6 px-2 rounded-xl">
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
                                <TableCell>{formatDate(order.created_at)}</TableCell>
                                <TableCell>
                                    <OrderStatusBadge status={order.status} />
                                </TableCell>
                            </motion.tr>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <div className="bg-background rounded-lg shadow-sm border border-gray-200 overflow-hidden md:hidden">
                <div className="divide-y divide-default-200">
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
