import { Link } from "@tanstack/react-router";
import type { Order } from "@/schemas";
import { ORDER_GRID, OrderCard, OrderTable } from "../orders/order-card";
import EmptyState from "@/components/generic/empty";
import { Package } from "lucide-react";
import { PageLoader } from "@/components/generic/page-loader";

const RecentOrdersList = ({ orders, isLoading }: { orders: Order[]; isLoading: boolean }) => {
    if (isLoading) {
        return <PageLoader variant="list" />;
    }

    if (!orders || orders.length === 0) {
        return (
            <EmptyState
                icon={Package}
                title="No orders yet"
                description="Your orders will appear here when they are available"
            />
        );
    }

    return (
        <div className="py-2 space-y-1.5">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium font-display">Recent Orders</h3>
                <Link className="text-sm font-medium" to="/admin/orders">
                    View all
                </Link>
            </div>

            <div className="hidden lg:block rounded-xl border border-border bg-card overflow-hidden">
                <div className={`grid ${ORDER_GRID} items-center gap-0 px-5 py-2.5 border-b border-border bg-muted/40`}>
                    <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground pr-4">Customer</span>
                    <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Total</span>
                    <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Order status</span>
                    <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Payment</span>
                    <span />
                </div>
                {orders.map((order) => (
                    <OrderTable key={order.id} order={order} />
                ))}
            </div>

            <div className="lg:hidden space-y-2">
                {orders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                ))}
            </div>
        </div>
    );
};

export default RecentOrdersList;