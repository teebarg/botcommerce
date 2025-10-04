import { Mail, Package } from "lucide-react";

const OrderNext: React.FC<{ isPickup?: boolean }> = ({ isPickup = false }) => {
    return (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold">{`What's Next?`}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg space-y-2 bg-secondary">
                    <div className="flex items-center space-x-2">
                        <Mail className="h-5 w-5 text-accent" />
                        <h4 className="font-medium">Email Confirmation</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">You will receive an order confirmation email shortly with all the details.</p>
                </div>

                <div className="p-4 border rounded-lg space-y-2 bg-secondary">
                    <div className="flex items-center space-x-2">
                        <Package className="h-5 w-5 text-accent" />
                        <h4 className="font-medium">{isPickup ? "Pickup Notification" : "Tracking Updates"}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {isPickup
                            ? "You'll receive a notification when your order is ready for pickup."
                            : "We'll send you tracking information once your order ships."}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OrderNext;
