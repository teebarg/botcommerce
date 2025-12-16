import { Link } from "@tanstack/react-router";
import { OrderStatusBadge, PaymentStatusBadge } from "../orders/order-status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Order } from "@/schemas";
import { currency, formatDate } from "@/utils";

const RecentOrdersList = ({ orders }: { orders: Order[] }) => {
    if (!orders) {
        return (
            <div className="px-2 md:px-10 py-8">
                <p>No orders found!</p>
            </div>
        );
    }

    return (
        <div className="px-4 md:px-10 py-8">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium font-display">Recent Orders</h3>
                <Link className="text-sm font-medium text-primary hover:underline" to="/admin/orders">
                    View all
                </Link>
            </div>
            <div className="hidden md:block py-6 px-2 rounded-xl bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>S/N</TableHead>
                            <TableHead>Order</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Payment Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders?.map((order: Order, idx: number) => (
                            <TableRow key={idx} className="odd:bg-background">
                                <TableCell className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-3">{idx + 1}</TableCell>
                                <TableCell className="whitespace-nowrap px-3 py-4 text-sm">{order.order_number}</TableCell>
                                <TableCell className="font-medium">
                                    {order.user?.first_name} {order.user?.last_name}
                                </TableCell>
                                <TableCell>{currency(order.total)}</TableCell>
                                <TableCell>{formatDate(order.created_at)}</TableCell>
                                <TableCell>
                                    <OrderStatusBadge status={order.status} />
                                </TableCell>
                                <TableCell>
                                    <PaymentStatusBadge status={order.payment_status} />
                                </TableCell>
                            </TableRow>
                        ))}
                        {orders?.length === 0 && (
                            <TableRow>
                                <TableCell className="h-24 text-center" colSpan={7}>
                                    No orders found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="rounded-lg shadow-sm overflow-hidden md:hidden">
                <div className="space-y-2">
                    {orders?.map((order: Order, idx: number) => (
                        <div key={idx} className="p-4 bg-card">
                            <div className="flex justify-between items-center mb-2 mt-2">
                                <span className="font-medium">{order.order_number}</span>
                                <PaymentStatusBadge status={order.payment_status} />
                            </div>
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>
                                    {order.user?.first_name} {order.user?.last_name}
                                </span>
                                <span className="font-medium text-foreground text-base">{currency(order.total)}</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">{formatDate(order.created_at)}</div>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-sm">Order Status:</span>
                                <OrderStatusBadge status={order.status} />
                            </div>
                        </div>
                    ))}
                    {orders?.length === 0 && (
                        <div className="p-4">
                            <p className="text-center text-muted-foreground">No orders found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecentOrdersList;
