"use client";

import { useEffect, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function UserAvatar() {
    const session: any = null;
    const [hasMounted, setHasMounted] = useState<boolean>(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    if (!hasMounted) {
        return null;
    }

    return (
        <Avatar className="h-8 w-8 cursor-pointer">
            <AvatarImage alt={session?.user?.first_name} src={session?.user?.image ?? undefined} />
            <AvatarFallback className="bg-green-600 text-white text-xs">
                {session?.user?.first_name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("") ?? "ME"}
            </AvatarFallback>
        </Avatar>
    );
}
