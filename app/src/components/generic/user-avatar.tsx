import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouteContext } from "@tanstack/react-router";

export function UserAvatar() {
    const { session } = useRouteContext({ strict: false });

    return (
        <Avatar className="h-8 w-8 cursor-pointer">
            <AvatarImage alt={session?.user?.first_name} src={session?.user?.image ?? undefined} />
            <AvatarFallback className="bg-green-600 text-white text-xs">
                {session?.user?.first_name
                    ?.split(" ")
                    ?.map((n) => n[0])
                    .join("") ?? "ME"}
            </AvatarFallback>
        </Avatar>
    );
}
