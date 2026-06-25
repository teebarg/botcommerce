import { Link } from "@tanstack/react-router";
import type { Order } from "@/schemas";
import OrderCard from "../orders/order-card";
import EmptyState from "@/components/generic/empty";
import { Package } from "lucide-react";
import { PageLoader } from "@/components/generic/page-loader";

const RecentOrdersList = ({ orders, isLoading }: { orders: Order[], isLoading: boolean }) => {
    if (!orders) {
        return (
            <EmptyState
                icon={Package}
                title="No orders yet"
                description={`Your orders will appear here when they are available`}
            />
        );
    }

    if (isLoading) {
        return <PageLoader variant="list" />
    }

    return (
        <div className="py-2">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium font-display">Recent Orders</h3>
                <Link className="text-sm font-medium text-accent" to="/admin/orders">
                    View all
                </Link>
            </div>
            <div className="rounded-xl border border-border bg-card overflow-hidden">
                {orders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                ))}
            </div>
        </div>
    );
};

export default RecentOrdersList;
