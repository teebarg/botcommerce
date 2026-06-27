import { OrderStatusBadge, PaymentStatusBadge } from "./order-status-badge";
import type { Order } from "@/schemas";
import { currency, formatDate } from "@/utils";
import OrderActions from "./order-actions";

interface OrderCardProps {
    order: Order;
}

export const ORDER_GRID = "grid-cols-[minmax(0,1fr)_120px_160px_120px_250px]";

function getInitials(firstName?: string, lastName?: string) {
    return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "?";
}

const OrderTable = ({ order }: OrderCardProps) => {
    const initials = getInitials(order.user?.first_name, order.user?.last_name);
    const fullName = `${order.user?.first_name ?? ""} ${order.user?.last_name ?? ""}`.trim();

    return (
        <div className={`grid bg-card even:bg-secondary ${ORDER_GRID} items-center gap-0 px-5 py-3.5 hover:bg-muted/40 transition-colors`}>
            <div className="flex items-center gap-3 min-w-0 pr-4">
                <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center text-xs font-semibold text-muted-foreground shrink-0">
                    {initials}
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{fullName}</p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="truncate">{order.order_number}</span>
                        <span>·</span>
                        <span className="shrink-0">{formatDate(order.created_at)}</span>
                        <span>·</span>
                        <span className="shrink-0">{order.order_items.length} {order.order_items.length === 1 ? "item" : "items"}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center">
                <p className="text-sm font-semibold text-foreground">{currency(order.total)}</p>
            </div>

            <div className="flex items-center">
                <OrderStatusBadge status={order.status} />
            </div>

            <div className="flex items-center">
                <PaymentStatusBadge status={order.payment_status} />
            </div>

            <div className="flex items-center justify-end">
                <OrderActions order={order} />
            </div>
        </div>
    );
};

const OrderCard = ({ order }: OrderCardProps) => {
    const initials = getInitials(order.user?.first_name, order.user?.last_name);
    const fullName = `${order.user?.first_name ?? ""} ${order.user?.last_name ?? ""}`.trim();

    return (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center text-xs font-semibold text-muted-foreground shrink-0">
                        {initials}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{fullName}</p>
                        <p className="text-xs text-muted-foreground">{order.order_number} · {formatDate(order.created_at)}</p>
                    </div>
                </div>
                <PaymentStatusBadge status={order.payment_status} />
            </div>

            <div className="grid grid-cols-2 gap-3 px-4 py-3 border-b border-border">
                <div>
                    <p className="text-2xs font-medium uppercase tracking-widest text-muted-foreground mb-1">Total</p>
                    <p className="text-sm font-semibold text-foreground">{currency(order.total)}</p>
                </div>
                <div>
                    <p className="text-2xs font-medium uppercase tracking-widest text-muted-foreground mb-1">Status</p>
                    <OrderStatusBadge status={order.status} />
                </div>
                <div>
                    <p className="text-2xs font-medium uppercase tracking-widest text-muted-foreground mb-1">Items</p>
                    <p className="text-sm text-foreground">{order.order_items.length} {order.order_items.length === 1 ? "item" : "items"}</p>
                </div>
            </div>

            <div className="px-4 py-3 bg-muted/50">
                <OrderActions order={order} />
            </div>
        </div>
    );
};

export { OrderCard, OrderTable };