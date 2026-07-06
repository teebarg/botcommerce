import { Badge } from "@/components/ui/badge";
import { OrderStatus } from "@/schemas";

interface PillProps {
    label: string;
    variant: "warning" | "success" | "default" | "outline" | "destructive" | "secondary" | "ghost"
}

export function PaymentStatusBadge({ status }: { status: string }) {
    const config: Record<string, { label: string; variant: PillProps["variant"] }> = {
        PENDING: { label: "Unpaid", variant: "warning" },
        SUCCESS: { label: "Paid", variant: "success" },
        FAILED: { label: "Failed", variant: "destructive" },
        REFUNDED: { label: "Refunded", variant: "secondary" },
    };

    const c = config[status] ?? config.PENDING;
    return (
        <Badge variant={c.variant}>
            {c.label}
        </Badge>
    );
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
    const config: Record<OrderStatus, { label: string; variant: PillProps["variant"] }> = {
        [OrderStatus.PENDING]: { label: "Pending", variant: "ghost" },
        [OrderStatus.PROCESSING]: { label: "Processing", variant: "default" },
        [OrderStatus.SHIPPED]: { label: "Order Packed", variant: "default" },
        [OrderStatus.OUT_FOR_DELIVERY]: { label: "Out for Delivery", variant: "outline" },
        [OrderStatus.DELIVERED]: { label: "Delivered", variant: "success" },
        [OrderStatus.CANCELED]: { label: "Cancelled", variant: "destructive" },
        [OrderStatus.REFUNDED]: { label: "Refunded", variant: "secondary" },
    };

    const c = config[status] ?? config[OrderStatus.PENDING];
    return (
        <Badge variant={c.variant}>
            {c.label}
        </Badge>
    );
}