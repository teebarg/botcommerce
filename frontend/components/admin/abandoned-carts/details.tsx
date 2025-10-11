import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Mail, MapPin, Clock, Package, Copy, ExternalLink, User, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import Overlay from "@/components/overlay";
import { useOverlayTriggerState } from "@react-stately/overlays";
import { Cart } from "@/schemas";
import { currency } from "@/lib/utils";

interface AbandonedCartDetailsDialogProps {
    cart: Cart | null;
}

export const AbandonedCartDetailsDialog = ({ cart }: AbandonedCartDetailsDialogProps) => {
    const state = useOverlayTriggerState({});
    if (!cart) return null;

    const handleCopyEmail = () => {
        navigator.clipboard.writeText(cart?.user?.email || "");
        toast.success("Email copied to clipboard");
    };

    const handleSendReminder = () => {
        toast.success(`Recovery email sent to ${cart?.user?.first_name} ${cart?.user?.last_name}`);
        state.close();
    };

    return (
        <Overlay
            sheetClassName="min-w-[30vw]"
            open={state.isOpen}
            onOpenChange={state.setOpen}
            title="Cart Details"
            trigger={<Button variant="contrast" onClick={state.open}>View Details</Button>}
        >
            <div className="max-w-4xl px-2 overflow-y-auto">
                <div className="-mx-2 px-2 py-6 bg-background sticky top-0 z-10">
                    <div className="flex items-center justify-between mt-4">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Customer Information
                        </h3>
                        {cart.status !== "CONVERTED" && (
                            <Button onClick={handleSendReminder}>
                                <Mail className="h-4 w-4 mr-2" />
                                Send Recovery Email
                            </Button>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg border bg-gradient-to-br from-contrast/5 to-primary/5">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Name</p>
                                <p className="font-medium">
                                    {cart?.user?.first_name} {cart?.user?.last_name}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Email</p>
                                <div className="flex items-center gap-2">
                                    <p className="font-medium">{cart?.user?.email}</p>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopyEmail}>
                                        <Copy className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Location</p>
                                <p className="font-medium flex items-center gap-1.5">
                                    <MapPin className="h-4 w-4" />
                                    {cart?.user?.addresses?.[0]?.city}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Cart ID</p>
                                <p className="font-medium font-mono text-sm">{cart.id}</p>
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
                                    <div className="w-20 h-20 rounded-lg overflow-hidden border bg-muted flex-shrink-0">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium mb-1">{item.name}</h4>
                                        <p className="text-sm text-muted-foreground mb-2">Quantity: {item.quantity}</p>
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium">{currency(item.price)}</p>
                                            <p className="font-semibold text-primary">{currency(item.price * item.quantity)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 rounded-lg border bg-muted/50 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="font-medium">{currency(cart.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Tax (10%)</span>
                                <span className="font-medium">{currency(cart.tax)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Shipping</span>
                                <span className="font-medium">{currency(cart.shipping_fee)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center">
                                <span className="font-semibold">Total</span>
                                <span className="text-2xl font-bold text-primary">
                                    {currency(cart.total)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Timeline & Recovery Info */}
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

                            {/* {cart.lastEmailSent && (
                                    <div className="p-4 rounded-lg border bg-card">
                                        <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                                            <TrendingUp className="h-4 w-4" />
                                            <span className="text-sm">Last Contact</span>
                                        </div>
                                        <p className="font-medium">{formatDistanceToNow(new Date(cart.lastEmailSent), { addSuffix: true })}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{new Date(cart.lastEmailSent).toLocaleString()}</p>
                                    </div>
                                )} */}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t -mx-2 px-2 py-4 bg-background sticky bottom-0">
                    <Button variant="contrast">
                        <ExternalLink className="h-4 w-4" />
                        Impersonate
                    </Button>
                    <Button variant="outline" onClick={() => state.close()}>
                        <X className="h-4 w-4" />
                        Close
                    </Button>
                </div>
            </div>
        </Overlay>
    );
};
