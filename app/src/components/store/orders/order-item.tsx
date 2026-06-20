import { currency } from "@/utils";
import type { OrderItem } from "@/schemas";
import ImageDisplay from "@/components/image-display";

export default function OrderItemComponent({ item }: { item: OrderItem }) {
    const variantText = [
        item.variant?.size && `Size: ${item.variant.size}`,
        item.variant?.color && `Color: ${item.variant.color}`,
        item.variant?.width && `Waist: ${item.variant.width}`,
        item.variant?.length && `Length: ${item.variant.length}`,
        item.variant?.age && `Age: ${item.variant.age}`,
    ].filter(Boolean).join(" · ");

    return (
        <div className="flex items-center gap-3 px-4 py-3">
            <div className="relative w-16 h-16 shrink-0 overflow-hidden rounded-lg bg-card ring-1 ring-border">
                <ImageDisplay className="rounded-lg" url={item?.image} alt={item.name} />
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.name}</p>
                {variantText && <p className="text-xs text-muted-foreground mt-0.5">{variantText}</p>}
                <p className="text-xs text-muted-foreground mt-1">
                    {item.quantity} × {currency(Number(item.price) || 0)}
                </p>
            </div>

            <span className="text-sm font-medium shrink-0">
                {currency((Number(item.price) || 0) * item.quantity)}
            </span>
        </div>
    );
}