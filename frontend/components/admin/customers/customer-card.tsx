import { ShoppingBag, CreditCard } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Order, User } from "@/types/models";
import { currency } from "@/lib/util/util";

interface CustomerCardProps {
    user: User;
    actions?: React.ReactNode;
}

const CustomerCard = ({ user, actions }: CustomerCardProps) => {
    const formatDate = (dateString?: string) => {
        if (!dateString) return "N/A";

        const date = new Date(dateString);

        return new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        }).format(date);
    };

    const fullName = `${user.first_name} ${user.last_name}`;

    const totalSpent = user.orders?.reduce((total: number, order: Order) => total + order.total, 0) || 0;

    return (
        <Card className="mb-3 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-medium text-lg">{fullName}</h3>
                        <p className="text-sm text-default-500">{user.email}</p>
                    </div>

                    {actions}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="flex items-center text-sm">
                        <ShoppingBag className="mr-1 text-default-500" size={14} />
                        <span>{user.orders?.length} orders</span>
                    </div>
                    <div className="flex items-center text-sm">
                        <CreditCard className="mr-1 text-default-500" size={14} />
                        <span>{currency(totalSpent)}</span>
                    </div>
                    {/* {user.addresses?.[0]?.phone && (
                        <div className="flex items-center text-sm">
                            <Phone className="mr-1" size={14} />
                            <span>{user.addresses?.[0]?.phone}</span>
                        </div>
                    )} */}
                    {user.orders?.[0]?.created_at && (
                        <div className="flex items-center text-sm">
                            <span className="text-xs text-default-500">Last order: {formatDate(user.orders?.[0].created_at)}</span>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default CustomerCard;
