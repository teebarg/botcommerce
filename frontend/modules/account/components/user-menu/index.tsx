"use client";

import { signOut } from "@modules/account/actions";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import React from "react";
import Image from "next/image";

import Dropdown from "@/components/ui/dropdown";
import ProfileAvatar from "@/public/profile.svg";

export default function UserDropDown({ customer }: any) {
    const handleLogout = async () => {
        await signOut();
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
            <Dropdown
                align="end"
                className="w-full"
                trigger={
                    <React.Fragment>
                        <div className="flex gap-2 w-full">
                            <span className="relative outline-none w-10 h-10 rounded-full ring-2 ring-offset-2 ring-default">
                                <Image fill alt="avatar" src={customer?.image || ProfileAvatar} />
                            </span>
                            <div className="inline-flex flex-1 justify-between">
                                <div className="inline-flex flex-col items-start justify-center">
                                    <span className="text-sm text-default-900">{customer?.lastname}</span>
                                    <span className="text-xs text-default-500">{customer?.email}</span>
                                </div>
                                <span
                                    className="md:hidden border-2 border-secondary text-secondary px-4 rounded-full flex items-center"
                                    data-testid="logout-button"
                                    role="button"
                                    onClick={handleLogout}
                                >
                                    Log out
                                </span>
                            </div>
                        </div>
                    </React.Fragment>
                }
            >
                <div className="bg-content1 box-border rounded-lg shadow-md p-3 min-w-[200px] text-sm font-medium">
                    <div key="user" className="h-14 gap-2">
                        <p className="font-bold">Signed in as</p>
                        <p className="font-bold">@{customer?.firstname}</p>
                    </div>
                    {links.map((item, index: number) => (
                        <div key={index} className="px-2 py-1.5 cursor-pointer" data-key={item.dataKey}>
                            {item.child}
                        </div>
                    ))}
                </div>
            </Dropdown>
        </React.Fragment>
    );
}
