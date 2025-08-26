"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/providers/auth-provider";
import { useEffect, useState } from "react";

export function UserAvatar() {
    const { user } = useAuth();
    const [hasMounted, setHasMounted] = useState<boolean>(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    if (!hasMounted) {
        return null;
    }

    return (
        <Avatar className="h-8 w-8 cursor-pointer">
            <AvatarImage alt={user?.first_name} src={user?.image ?? undefined} />
            <AvatarFallback className="bg-green-600 text-white text-xs">
                {user?.first_name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("") ?? "ME"}
            </AvatarFallback>
        </Avatar>
    );
}
