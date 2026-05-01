import { createFileRoute, Link } from "@tanstack/react-router";
import { cn, currency, formatDate } from "@/utils";
import { ChevronRight, Clock, Heart, MapPin, Package } from "lucide-react";
import { useOverlayTriggerState } from "react-stately";
import type { Order } from "@/schemas";
import Overlay from "@/components/overlay";
import OrderDetails from "@/components/store/orders/order-details";
import { ordersQuery } from "@/queries/user.queries";
import { useSuspenseQuery } from "@tanstack/react-query";

const OrderItem: React.FC<{ order: Order; idx: number }> = ({ order, idx }) => {
    const state = useOverlayTriggerState({});

    return (
        <Overlay
            open={state.isOpen}
            trigger={
                <div
                    key={order.id + idx}
                    className="bg-card rounded-2xl p-4 border border-border flex items-center gap-4 animate-in fade-in slide-in-from-left-4 duration-300"
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

export const Route = createFileRoute("/_mainLayout/account/")({
    loader: async ({ context: { queryClient } }) => {
        await queryClient.ensureQueryData(ordersQuery({}));
    },
    component: RouteComponent,
});

function RouteComponent() {
    const { session } = Route.useRouteContext();
    const { data } = useSuspenseQuery(ordersQuery({}));

    return (
        <div className="px-2 md:px-0 pt-6 space-y-6">
            <div className="text-center">
                <div className="w-20 h-20 mx-auto rounded-full gradient-primary mb-4">
                    <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                        <img src={session?.user?.image} className="object-contain" />
                    </div>
                </div>
                <h2 className="text-xl font-bold">Welcome back, {session?.user?.firstName}!</h2>
                <p className="text-muted-foreground text-sm">Member since January 2024</p>
            </div>
            <div className="grid grid-cols-3 gap-3 animate-in fade-in slide-in-from-bottom-4 duration-100">
                <div className="bg-card rounded-2xl p-4 text-center border border-border animate-in fade-in zoom-in-90 duration-300 delay-100">
                    <div className="w-10 h-10 mx-auto rounded-xl gradient-primary flex items-center justify-center mb-2">
                        <Heart className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-2xl font-bold">{data?.items?.length}</p>
                    <p className="text-xs text-muted-foreground">Total Orders</p>
                </div>
                <div
                    className="bg-card rounded-2xl p-4 text-center border border-border animate-in fade-in zoom-in-90 duration-300 delay-150"
                >
                    <div className="w-10 h-10 mx-auto rounded-xl gradient-primary flex items-center justify-center mb-2">
                        <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-xs text-muted-foreground">Wishlist Items</p>
                </div>
                <div
                    className="bg-card rounded-2xl p-4 text-center border border-border animate-in fade-in zoom-in-90 duration-300 delay-200"
                >
                    <div className="w-10 h-10 mx-auto rounded-xl gradient-primary flex items-center justify-center mb-2">
                        <Package className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-2xl font-bold">1</p>
                    <p className="text-xs text-muted-foreground">Saved Addresses</p>
                </div>
            </div>
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-200">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Recent Orders</h3>
                    <Link to="/account/orders" className="text-sm text-primary flex items-center gap-1">
                        View All
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="space-y-3">
                    {data?.items?.slice(0, 5)?.map((order: Order, idx: number) => (
                        <OrderItem key={idx} order={order} idx={idx} />
                    ))}
                    {data?.items?.length === 0 && (
                        <div
                            className="bg-card rounded-2xl p-4 border border-border flex items-center gap-4 animate-in fade-in slide-in-from-left-4 duration-300 delay-[250ms]"
                        >
                            No orders found
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
