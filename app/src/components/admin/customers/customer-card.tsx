import { ShoppingBag, CreditCard } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Order, Status, User } from "@/schemas";
import { currency, formatDate } from "@/utils";
import { Badge } from "@/components/ui/badge";
import CustomerActions from "./customer-actions";

interface CustomerCardProps {
    user: User;
}

const CustomerCard = ({ user }: CustomerCardProps) => {
    const fullName = `${user?.first_name} ${user?.last_name}`;

    const totalSpent = user.orders?.reduce((total: number, order: Order) => total + order.total, 0) || 0;

    const getStatusBadge = (status?: Status) => {
        const variants: Record<Status, "destructive" | "emerald" | "warning"> = {
            ["PENDING"]: "warning",
            ["ACTIVE"]: "emerald",
            ["INACTIVE"]: "destructive",
        };

        return <Badge variant={variants[status ?? "PENDING"]}>{status}</Badge>;
    };

    return (
        <Card className="mb-3 overflow-hidden hover:shadow-md transition-shadow bg-card p-4">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-medium text-lg">{fullName}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <CustomerActions user={user} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="flex items-center text-sm">
                    <ShoppingBag className="mr-1 text-muted-foreground" size={14} />
                    <span>{user.orders?.length} orders</span>
                </div>
                <div className="flex items-center text-sm">
                    <CreditCard className="mr-1 text-muted-foreground" size={14} />
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
                        <span className="text-xs text-muted-foreground">Last order: {formatDate(user.orders?.[0].created_at)}</span>
                    </div>
                )}
            </div>
            <div className="flex gap-2">
                {getStatusBadge(user.status as Status)}
                <Badge variant={user.role == "ADMIN" ? "contrast" : "default"}>{user.role}</Badge>
            </div>
        </Card>
    );
};

export default CustomerCard;
