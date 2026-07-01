import type { BadgeVariant, User } from "@/schemas";
import { Badge } from "@/components/ui/badge";
import CustomerActions from "./customer-actions";

interface CustomerCardProps {
    user: User;
}

const CustomerCard = ({ user }: CustomerCardProps) => {
    const fullName = `${user?.first_name} ${user?.last_name}`;

    const getStatusBadge = (status?: any) => {
        const variants: Record<any, BadgeVariant> = {
            ["PENDING"]: "warning",
            ["ACTIVE"]: "success",
            ["INACTIVE"]: "destructive",
        };
        return <Badge variant={variants[status ?? "PENDING"]}>{status}</Badge>;
    };

    return (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="flex items-start justify-between gap-4 mb-2 px-5 py-4">
                <div className="min-w-0">
                    <p className="text-xs font-medium uppercase text-muted-foreground mb-1 truncate">
                        {fullName}
                    </p>
                    <h3 className="text-sm font-medium truncate">{user.email}</h3>
                </div>
                {getStatusBadge(user.status)}
            </div>
            <div className="border-t border-border px-5 py-2.5 bg-muted/50 flex items-center justify-between">
                <Badge variant={user.role == "ADMIN" ? "accent" : "default"}>{user.role}</Badge>
                <CustomerActions user={user} />
            </div>
        </div>
    )
};

export default CustomerCard;
