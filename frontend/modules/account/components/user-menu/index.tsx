"use client";

import React from "react";
import Image from "next/image";

import ProfileAvatar from "@/public/profile.svg";
import LocalizedClientLink from "@/components/ui/link";
import { Session } from "@/lib/models";
import { api } from "@/apis";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function UserDropDown({ user }: { user: Session }) {
    const handleLogout = async () => {
        await api.auth.logOut();
    };

    const links = [
        {
            dataKey: "admin",
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
                <button aria-label="log out" data-testid="logout-button" type="button" onClick={handleLogout}>
                    Log out
                </button>
            ),
        },
    ];

    return (
        <React.Fragment>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <div className="flex gap-2 w-full">
                        <span className="relative outline-none w-10 h-10 rounded-full ring-2 ring-offset-2 ring-default">
                            <Image fill alt="avatar" src={user?.image || ProfileAvatar} />
                        </span>
                        <div className="inline-flex flex-1 justify-between">
                            <div className="inline-flex flex-col items-start justify-center">
                                <span className="text-sm text-default-900">{user?.last_name}</span>
                                <span className="text-xs text-default-500">{user?.email}</span>
                            </div>
                            <span
                                aria-label="logout"
                                className="md:hidden border-2 border-primary text-primary px-4 rounded-full flex items-center"
                                data-testid="logout-button"
                                role="button"
                                onClick={handleLogout}
                            >
                                Log out
                            </span>
                        </div>
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                        <div key="user" className="gap-2 flex min-w-[15rem]">
                            <p className="font-bold">Signed in as</p>
                            <p className="font-bold">@{user?.first_name}</p>
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
        </React.Fragment>
    );
}
