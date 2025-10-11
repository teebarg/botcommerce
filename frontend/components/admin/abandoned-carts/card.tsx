import { Clock, Mail, Package, MapPin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { AbandonedCartDetailsDialog } from "./details";
import { ReminderButton } from "./reminder-button";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cart } from "@/schemas";
import { currency } from "@/lib/utils";
import { useSendCartReminder } from "@/lib/hooks/useAbandonedCart";

interface AbandonedCartCardProps {
    cart: Cart;
}

export const AbandonedCartCard = ({ cart }: AbandonedCartCardProps) => {
    const sendReminderMutation = useSendCartReminder();

    const getStatusColor = (status: string) => {
        switch (status) {
            case "ABANDONED":
                return "bg-amber-500/10 text-amber-500 border-amber-500/20";
            case "ACTIVE":
                return "bg-green-500/10 text-green-500 border-green-500/20";
            default:
                return "bg-muted text-muted-foreground border-border";
        }
    };

    const handleSendReminder = () => {
        sendReminderMutation.mutate(cart.id);
    };

    return (
        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/50">
            <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                    <h3 className="font-semibold text-lg">
                                        {cart.user_id ? `${cart.user?.first_name} ${cart.user?.last_name}` : "Guest User"}
                                    </h3>
                                    <Badge className={getStatusColor(cart.status!)}>
                                        {cart.status!.charAt(0).toUpperCase() + cart.status!.slice(1)}
                                    </Badge>
                                </div>
                                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                    {cart.email ||
                                        (cart.user?.email && (
                                            <span className="flex items-center gap-1.5">
                                                <Mail className="h-4 w-4" />
                                                {cart.email || cart.user?.email}
                                            </span>
                                        ))}
                                    {cart.shipping_address && (
                                        <span className="flex items-center gap-1.5">
                                            <MapPin className="h-4 w-4" />
                                            {cart.shipping_address.city}, {cart.shipping_address.state}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground">{cart.cart_number}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium mb-4">
                                <Package className="h-4 w-4" />
                                <span>
                                    {cart.items?.length || 0} item{(cart.items?.length || 0) !== 1 ? "s" : ""} in cart
                                </span>
                            </div>
                            {cart.items && cart.items.length > 0 && (
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {cart.items.slice(0, 3).map((item) => (
                                        <div key={item.id} className="group relative">
                                            <div className="w-20 h-20 rounded-lg overflow-hidden border bg-muted">
                                                <img
                                                    alt={item.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                    src={item.image || "/placeholder.jpg"}
                                                />
                                            </div>
                                            {item.quantity > 1 && (
                                                <Badge className="absolute top-0 -right-3 h-5 w-5 p-0 justify-center" variant="contrast">
                                                    {item.quantity}
                                                </Badge>
                                            )}
                                        </div>
                                    ))}
                                    {cart.items.length > 3 && (
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            <span>and {cart.items.length - 3} more...</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>Abandoned {formatDistanceToNow(new Date(cart.created_at), { addSuffix: true })}</span>
                            </div>
                            {/* {cart.lastEmailSent && (
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                    <TrendingUp className="h-4 w-4" />
                                    <span>Last email {formatDistanceToNow(new Date(cart.lastEmailSent), { addSuffix: true })}</span>
                                </div>
                            )} */}
                        </div>
                    </div>

                    <div className="flex flex-col justify-between items-end gap-4 min-w-[200px]">
                        <div className="hidden md:block text-right">
                            <div className="text-sm text-muted-foreground mb-1">Cart Value</div>
                            <div className="text-3xl font-bold">{currency(cart.total || 0)}</div>
                        </div>

                        <div className="flex flex-col gap-2 w-full">
                            {cart.status !== "CONVERTED" && cart.user_id && <ReminderButton id={cart.id} />}
                            <AbandonedCartDetailsDialog cart={cart} />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
