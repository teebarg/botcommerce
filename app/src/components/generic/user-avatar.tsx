import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, getInitials } from "@/utils";
import { useRouteContext } from "@tanstack/react-router";

export function UserAvatar({ className }: { className?: string }) {
    const { user } = useRouteContext({ strict: false });

    return (
        <Avatar className={cn("h-8 w-8 cursor-pointer", className)}>
            <AvatarImage alt={user?.firstName} src={user?.image ?? undefined} />
            <AvatarFallback className="bg-green-600 text-white text-xs">{getInitials(user?.firstName ?? "")}</AvatarFallback>
        </Avatar>
    );
}
