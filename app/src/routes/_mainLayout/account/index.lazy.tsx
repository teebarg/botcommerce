import { Link, createLazyFileRoute } from "@tanstack/react-router";
import { currency, formatDate } from "@/utils";
import { ChevronRight, Clock, Heart, Home, MapPin, Package } from "lucide-react";
import { useOverlayTriggerState } from "react-stately";
import type { Order } from "@/schemas";
import Overlay from "@/components/overlay";
import OrderDetails from "@/components/store/orders/order-details";
import { PageLoader } from "@/components/generic/page-loader";
import EmptyState from "@/components/generic/empty";
import { useOrders } from "@/hooks/useOrder";
import { cn } from "@/utils/cn";

const OrderItem: React.FC<{ order: Order; idx: number }> = ({ order, idx }) => {
    const state = useOverlayTriggerState({});

    return (
        <Overlay
            open={state.isOpen}
            trigger={
                <div
                    key={order.id + idx}
                    className="bg-card rounded-2xl p-4 border border-border flex items-center gap-4"
                    style={{ animationDelay: `${250 + idx * 50}ms` }}
                >
                    <img src={order.order_items[0].image} alt="Order item" className="w-14 h-14 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{order.order_number}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(order.created_at)}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                            <span
                                className={cn(
                                    "text-xs px-2 py-0.5 rounded-full",
                                    order.status === "DELIVERED" ? "bg-accent text-accent-foreground" : "bg-primary/20 text-primary"
                                )}
                            >
                                {order.status}
                            </span>
                            <span className="text-xs text-muted-foreground">{order.order_items.length} items</span>
                        </div>
                    </div>
                    <p className="font-semibold">{currency(order.total)}</p>
                </div>
            }
            onOpenChange={state.setOpen}
            showHeader={true}
            sheetClassName="md:max-w-6xl"
            title={<div className="text-base">Order Details ({order.order_number})</div>}
        >
            <OrderDetails order={order} />
        </Overlay>
    );
};

export const Route = createLazyFileRoute("/_mainLayout/account/")({
    component: RouteComponent,
});

function RouteComponent() {
    const { user } = Route.useRouteContext();
    const { data, isPending } = useOrders();

    return (
        <div className="px-2 md:px-0 pt-6 space-y-6">
            <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary mb-4 overflow-hidden">
                    <img src={user?.image} className="object-contain" />
                </div>
                <h2 className="text-xl font-bold">Welcome back, {user?.firstName}!</h2>
                <p className="text-muted-foreground text-sm">Member since January 2024</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-card rounded-2xl p-4 text-center border border-border">
                    <div className="w-10 h-10 mx-auto rounded-xl bg-primary flex items-center justify-center mb-2">
                        <Heart className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-2xl font-bold">{isPending ? "..." : data?.items?.length}</p>
                    <p className="text-xs text-muted-foreground">Total Orders</p>
                </div>
                <div
                    className="bg-card rounded-2xl p-4 text-center border border-border"
                >
                    <div className="w-10 h-10 mx-auto rounded-xl bg-primary flex items-center justify-center mb-2">
                        <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-xs text-muted-foreground">Wishlist Items</p>
                </div>
                <div
                    className="bg-card rounded-2xl p-4 text-center border border-border"
                >
                    <div className="w-10 h-10 mx-auto rounded-xl bg-primary flex items-center justify-center mb-2">
                        <Home className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-2xl font-bold">1</p>
                    <p className="text-xs text-muted-foreground">Saved Addresses</p>
                </div>
            </div>
            <div>
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Recent Orders</h3>
                    <Link to="/account/orders" className="text-sm text-accent flex items-center gap-1">
                        View All
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
                <div className="space-y-3">
                    {isPending ? (
                        <PageLoader variant="list" />
                    ) : data?.items?.length == 0 ? (
                        <EmptyState
                            title="No orders found"
                            description="You currently don't have no orders"
                            icon={Package}
                        />
                    ) : data?.items?.slice(0, 5)?.map((order: Order, idx: number) => (
                        <OrderItem key={idx} order={order} idx={idx} />
                    ))}
                </div>
            </div>
        </div>
    );
}
