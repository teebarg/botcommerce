import { Mail, Package } from "lucide-react";

export default function OrderNext({ isPickup = false }: { isPickup?: boolean }) {
    return (
        <div className="rounded-xl border bg-card overflow-hidden mb-4">
            <div className="px-4 py-3 border-b">
                <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground">What's next</p>
            </div>
            <div className="divide-y divide-border">
                <div className="flex items-start gap-3 px-4 py-3">
                    <Mail className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                        <p className="text-sm font-medium">Email confirmation</p>
                        <p className="text-xs text-muted-foreground mt-0.5">You'll receive an order confirmation email shortly.</p>
                    </div>
                </div>
                <div className="flex items-start gap-3 px-4 py-3">
                    <Package className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                        <p className="text-sm font-medium">{isPickup ? "Pickup notification" : "Tracking updates"}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {isPickup
                                ? "We'll notify you when your order is ready for pickup."
                                : "We'll send tracking info once your order ships."}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}