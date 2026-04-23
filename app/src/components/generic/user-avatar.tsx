import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, getInitials } from "@/utils";
import { useRouteContext } from "@tanstack/react-router";

export function UserAvatar({ className }: { className?: string }) {
    const { session } = useRouteContext({ strict: false });

    return (
        <Avatar className={cn("h-8 w-8 cursor-pointer", className)}>
            <AvatarImage alt={session?.user?.firstName} src={session?.user?.image ?? undefined} />
            <AvatarFallback className="bg-green-600 text-white text-xs">{getInitials(session?.user?.firstName ?? "")}</AvatarFallback>
        </Avatar>
    );
}
