import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Mail, DollarSign, Package, User, MapPin, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Cart } from "@/schemas";

interface AbandonedCartCardProps {
    cart: Cart;
}

export const AbandonedCartCard = ({ cart }: AbandonedCartCardProps) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case "active":
                return "bg-amber-500/10 text-amber-500 border-amber-500/20";
            case "recovered":
                return "bg-green-500/10 text-green-500 border-green-500/20";
            case "expired":
                return "bg-muted text-muted-foreground border-border";
            default:
                return "bg-muted text-muted-foreground border-border";
        }
    };

    const handleSendReminder = () => {
        toast.success(`Recovery email sent to ${cart.email}`);
    };

    const handleViewDetails = () => {
        toast.info("Opening detailed cart view...");
    };

    return (
        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/50">
            <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Customer Info */}
                    <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                    <h3 className="font-semibold text-lg">{cart.user_id}</h3>
                                    <Badge className={getStatusColor(cart.status!)}>
                                        {cart.status!.charAt(0).toUpperCase() + cart.status!.slice(1)}
                                    </Badge>
                                </div>
                                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1.5">
                                        <Mail className="h-4 w-4" />
                                        {cart.email}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <MapPin className="h-4 w-4" />
                                        {cart.shipping_address.city}, {cart.shipping_address.state}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Cart Items Preview */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <Package className="h-4 w-4" />
                                <span>
                                    {cart.items.length} item{cart.items.length !== 1 ? "s" : ""} in cart
                                </span>
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {cart.items.map((item) => (
                                    <div key={item.id} className="flex-shrink-0 group relative">
                                        <div className="w-16 h-16 rounded-lg overflow-hidden border bg-muted">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                            />
                                        </div>
                                        {item.quantity > 1 && (
                                            <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                                                {item.quantity}
                                            </Badge>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Metadata */}
                        <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>Abandoned {formatDistanceToNow(new Date(cart.abandonedAt), { addSuffix: true })}</span>
                            </div>
                            {cart.recoveryAttempts > 0 && (
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                    <Mail className="h-4 w-4" />
                                    <span>
                                        {cart.recoveryAttempts} reminder{cart.recoveryAttempts !== 1 ? "s" : ""} sent
                                    </span>
                                </div>
                            )}
                            {cart.lastEmailSent && (
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                    <TrendingUp className="h-4 w-4" />
                                    <span>Last email {formatDistanceToNow(new Date(cart.lastEmailSent), { addSuffix: true })}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col justify-between items-end gap-4 min-w-[200px]">
                        <div className="text-right">
                            <div className="text-sm text-muted-foreground mb-1">Cart Value</div>
                            <div className="text-3xl font-bold text-primary flex items-center gap-1">
                                <DollarSign className="h-6 w-6" />
                                {cart.totalValue.toFixed(2)}
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 w-full">
                            {cart.status === "ACTIVE" && (
                                <Button onClick={handleSendReminder} className="w-full">
                                    <Mail className="h-4 w-4 mr-2" />
                                    Send Reminder
                                </Button>
                            )}
                            <Button variant="outline" onClick={handleViewDetails} className="w-full">
                                View Details
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
