"use client";

import React from "react";
import { signOut } from "next-auth/react";

import LocalizedClientLink from "@/components/ui/link";
import { Session } from "@/schemas";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authApi } from "@/apis/auth";
import { useInvalidateMe } from "@/lib/hooks/useUser";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { deleteCookie } from "@/lib/util/cookie";
import { useInvalidateCart } from "@/lib/hooks/useCart";

export default function UserDropDown({ user }: { user: Session }) {
    const invalidate = useInvalidateMe();
    const invalidateCart = useInvalidateCart();
    const handleLogout = async () => {
        deleteCookie("_cart_id");
        await authApi.logOut();
        await signOut();
        invalidate();
        invalidateCart();
        window.location.href = "/";
    };

    const links = [
        {
            dataKey: "profile",
            child: (
                <span className="flex-1 text-sm font-normal truncate">
                    <LocalizedClientLink href="/account/profile">Profile</LocalizedClientLink>
                </span>
            ),
        },
        {
            dataKey: "account",
            child: (
                <span className="flex-1 text-sm font-normal truncate">
                    <LocalizedClientLink href="/account">Dashboard</LocalizedClientLink>
                </span>
            ),
        },
        {
            dataKey: "account",
            child: (
                <button aria-label="log out" className="text-red-500 cursor-pointer" data-testid="logout-button" type="button" onClick={handleLogout}>
                    Log out
                </button>
            ),
        },
    ];

    if (user.role === "ADMIN") {
        links.unshift({
            dataKey: "admin",
            child: (
                <span className="flex-1 text-sm font-normal truncate">
                    <LocalizedClientLink href="/admin">Admin</LocalizedClientLink>
                </span>
            ),
        });
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <Avatar>
                    <AvatarImage alt="@user" src={user.image ?? undefined} />
                    <AvatarFallback>{user?.first_name ? user?.first_name?.[0] + user?.last_name?.[0] : "GU"}</AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                    <div key="user" className="flex gap-2">
                        <p className="font-semibold">Signed in as</p>
                        <p className="font-semibold">
                            @{user?.first_name} {user?.last_name}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {links.map((item, index: number) => (
                    <DropdownMenuItem key={index} className="px-2 py-1.5 cursor-pointer" data-key={item.dataKey}>
                        {item.child}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
