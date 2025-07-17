"use client";

import React from "react";
import Image from "next/image";

import ProfileAvatar from "@/public/profile.svg";
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
import { useInvalidate } from "@/lib/hooks/useApi";

export default function UserDropDown({ user }: { user: Session }) {
    const invalidate = useInvalidate();
    const handleLogout = async () => {
        await authApi.logOut();
        invalidate("me");
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
            <DropdownMenuTrigger asChild>
                <span className="relative outline-none w-10 h-10 rounded-full ring-2 ring-offset-1 ring-green-200 cursor-pointer">
                    <Image fill alt="avatar" sizes="40px" src={user?.image || ProfileAvatar} />
                </span>
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
