import { OrderStatus } from "@/schemas";

interface PillProps {
    label: string;
    variant: "warn" | "success" | "blue" | "orange" | "red" | "muted";
}

function Pill({ label, variant }: PillProps) {
    const styles: Record<PillProps["variant"], string> = {
        warn: "bg-warning-subtle text-warning-subtle-foreground",
        success: "bg-success text-success-foreground",
        blue: "bg-primary/10 text-primary",
        orange: "bg-accent-subtle text-accent-subtle-foreground",
        red: "bg-destructive/10 text-destructive",
        muted: "bg-muted text-muted-foreground",
    };

    return (
        <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${styles[variant]}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60 shrink-0" />
            {label}
        </span>
    );
}

export function PaymentStatusBadge({ status }: { status: string }) {
    const config: Record<string, { label: string; variant: PillProps["variant"] }> = {
        PENDING: { label: "Unpaid", variant: "warn" },
        SUCCESS: { label: "Paid", variant: "success" },
        FAILED: { label: "Failed", variant: "red" },
        REFUNDED: { label: "Refunded", variant: "muted" },
    };

    const c = config[status] ?? config.PENDING;
    return <Pill label={c.label} variant={c.variant} />;
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
    const config: Record<OrderStatus, { label: string; variant: PillProps["variant"] }> = {
        [OrderStatus.PENDING]: { label: "Pending", variant: "warn" },
        [OrderStatus.PROCESSING]: { label: "Processing", variant: "blue" },
        [OrderStatus.SHIPPED]: { label: "Order Packed", variant: "blue" },
        [OrderStatus.OUT_FOR_DELIVERY]: { label: "Out for Delivery", variant: "orange" },
        [OrderStatus.DELIVERED]: { label: "Delivered", variant: "success" },
        [OrderStatus.CANCELED]: { label: "Cancelled", variant: "red" },
        [OrderStatus.REFUNDED]: { label: "Refunded", variant: "muted" },
    };

    const c = config[status] ?? config[OrderStatus.PENDING];
    return <Pill label={c.label} variant={c.variant} />;
}