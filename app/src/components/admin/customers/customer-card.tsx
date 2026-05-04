import type { User } from "@/schemas";
import { Badge } from "@/components/ui/badge";
import CustomerActions from "./customer-actions";

interface CustomerCardProps {
    user: User;
}

const CustomerCard = ({ user }: CustomerCardProps) => {
    const fullName = `${user?.first_name} ${user?.last_name}`;

    const getStatusBadge = (status?: any) => {
        const variants: Record<any, "destructive" | "success-subtle" | "warning"> = {
            ["PENDING"]: "warning",
            ["ACTIVE"]: "success-subtle",
            ["INACTIVE"]: "destructive",
        };

        return <Badge variant={variants[status ?? "PENDING"]}>{status}</Badge>;
    };

    return (
        <div className="overflow-hidden bg-card md:even:bg-background rounded-lg md:rounded-none">
            <div className="hidden md:grid grid-cols-[1fr_400px_120px_120px_140px] items-center gap-4 px-4 text-sm py-2">
                <p className="truncate">{fullName}</p>
                <p className="truncate text-muted-foreground">{user.email}</p>
                <div className="justify-self-start">
                    {getStatusBadge(user.status)}
                </div>
                <div className="justify-self-start">
                    <Badge variant={user.role == "ADMIN" ? "accent" : "default"}>{user.role}</Badge>
                </div>
                <div>
                    <CustomerActions user={user} />
                </div>
            </div>
            <div className="md:hidden p-5">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-medium text-lg">{fullName}</h3>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <CustomerActions user={user} />
                </div>
                <div className="flex gap-2 mt-4">
                    {getStatusBadge(user.status)}
                    <Badge variant={user.role == "ADMIN" ? "accent" : "default"}>{user.role}</Badge>
                </div>
            </div>
        </div>
    );
};

export default CustomerCard;
