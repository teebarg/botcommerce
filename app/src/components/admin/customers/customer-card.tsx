import type { BadgeVariant, User } from "@/schemas";
import { Badge } from "@/components/ui/badge";
import CustomerActions from "./customer-actions";
import { timeAgo } from "@/utils";

interface Props {
    user: User;
}

const CustomerCard = ({ user }: Props) => {
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
            <div className="flex items-start justify-between gap-4 p-4">
                <div className="min-w-0 space-y-1.5 text-xs">
                    <p className="font-medium uppercase text-muted-foreground truncate">
                        {fullName}
                    </p>
                    <h3 className="text-sm font-medium truncate">{user.email}</h3>
                    {user.phone && (
                        <p className="font-medium">{user.phone}</p>
                    )}
                    <div className="text-muted-foreground">
                        {timeAgo(user?.created_at)}
                    </div>
                </div>
                {getStatusBadge(user.status)}
            </div>
            <div className="border-t border-border px-5 py-2 bg-muted/50 flex items-center justify-between">
                <Badge variant={user.role == "ADMIN" ? "accent" : "default"}>{user.role}</Badge>
                <CustomerActions user={user} />
            </div>
        </div>
    )
};

export default CustomerCard;
