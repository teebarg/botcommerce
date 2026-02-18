import { MapPin, Clock, Package, Copy, ExternalLink, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useOverlayTriggerState } from "react-stately";
import { ReminderButton } from "./reminder-button";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Overlay from "@/components/overlay";
import type { Cart } from "@/schemas";
import { currency } from "@/utils";
import { useInvalidateCart } from "@/hooks/useCart";
import { useInvalidateMe } from "@/hooks/useUser";
import ImageDisplay from "@/components/image-display";
import { useRouteContext, useRouter } from "@tanstack/react-router";
import { updateAuthSession } from "@/utils/auth-client";

interface AbandonedCartDetailsDialogProps {
    cart: Cart | null;
}

export const AbandonedCartDetailsDialog = ({ cart }: AbandonedCartDetailsDialogProps) => {
    const state = useOverlayTriggerState({});
    const { session } = useRouteContext({ strict: false });
    const router = useRouter();
    const invalidateMe = useInvalidateMe();
    const invalidateCart = useInvalidateCart();

    if (!cart) return null;

    const handleCopyEmail = () => {
        navigator.clipboard.writeText(cart?.user?.email || "");
        toast.success("Email copied to clipboard");
    };

    const handleImpersonation = async () => {
        try {
            await updateAuthSession({
                email: cart?.user?.email!,
                mode: "impersonate",
                impersonated: true,
                impersonatedBy: session?.user?.email,
            });

            invalidateMe();
            invalidateCart();

            toast.success("Impersonated");

            await router.invalidate();
            await router.navigate({ to: "/" });
        } catch (err) {
            console.error("Impersonation failed", err);
        }
    };

    return (
        <Overlay
            open={state.isOpen}
            sheetClassName="min-w-[30vw]"
            title={<div className="py-1.5">{cart.status !== "CONVERTED" && <ReminderButton id={cart.id} />}</div>}
            trigger={
                <Button variant="contrast" onClick={state.open}>
                    View Details
                </Button>
            }
            onOpenChange={state.setOpen}
        >
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="space-y-6 flex-1 px-2.5 overflow-auto">
                    <div>
                        <h3 className="font-semibold text-lg flex items-center gap-2 mb-2">
                            <User className="h-5 w-5" />
                            Customer Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg border bg-linear-to-br from-contrast/5 to-primary/5">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Name</p>
                                {cart?.user?.first_name ? (
                                    <p className="font-medium">
                                        {cart?.user?.first_name} {cart?.user?.last_name}
                                    </p>
                                ) : (
                                    <p className="font-medium">Guest</p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Email</p>
                                {cart?.user?.email ? (
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium">{cart?.user?.email}</p>
                                        <Button className="h-6 w-6" size="icon" variant="ghost" onClick={handleCopyEmail}>
                                            <Copy className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ) : (
                                    <p className="font-medium">N/A</p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Location</p>
                                {cart?.user?.addresses?.[0] ? (
                                    <p className="font-medium flex items-center gap-1.5">
                                        <MapPin className="h-4 w-4" />
                                        {cart?.user?.addresses?.[0]?.state}
                                    </p>
                                ) : (
                                    <p className="font-medium">N/A</p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Cart Number</p>
                                <p className="font-medium font-mono text-sm">{cart.cart_number}</p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Cart Items ({cart.items.length})
                        </h3>
                        <div className="space-y-3">
                            {cart.items.map((item) => (
                                <div key={item.id} className="flex gap-4 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                                    <div className="w-20 h-20 rounded-lg overflow-hidden border bg-muted shrink-0">
                                        <ImageDisplay alt={item.name} url={item.image} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium mb-1">{item.name}</h4>
                                        <p className="text-sm text-muted-foreground mb-2">Quantity: {item.quantity}</p>
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium">{currency(item.price)}</p>
                                            <p className="font-semibold">{currency(item.price * item.quantity)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 rounded-lg border bg-muted/50 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="font-medium">{currency(cart.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Tax</span>
                                <span className="font-medium">{currency(cart.tax)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Shipping</span>
                                <span className="font-medium">{currency(cart.shipping_fee)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center">
                                <span className="font-semibold">Total</span>
                                <span className="text-2xl font-bold">{currency(cart.total)}</span>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-4 mb-4">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Recovery Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 rounded-lg border bg-card">
                                <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    <span className="text-sm">Abandoned</span>
                                </div>
                                <p className="font-medium">{formatDistanceToNow(new Date(cart.created_at), { addSuffix: true })}</p>
                                <p className="text-xs text-muted-foreground mt-1">{new Date(cart.created_at).toLocaleString()}</p>
                            </div>

                            {/* <div className="p-4 rounded-lg border bg-card">
                                    <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                                        <Mail className="h-4 w-4" />
                                        <span className="text-sm">Recovery Attempts</span>
                                    </div>
                                    <p className="font-medium text-2xl">{cart.recoveryAttempts}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {cart.recoveryAttempts === 0 ? "No emails sent yet" : "emails sent"}
                                    </p>
                                </div> */}
                        </div>
                    </div>
                </div>

                <div className="sheet-footer">
                    {cart?.user?.email && (
                        <Button variant="contrast" onClick={handleImpersonation}>
                            <ExternalLink className="h-4 w-4" />
                            Impersonate
                        </Button>
                    )}
                    <Button variant="outline" onClick={() => state.close()}>
                        Cancel
                    </Button>
                </div>
            </div>
        </Overlay>
    );
};
