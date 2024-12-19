"use client";

import { cn } from "@lib/util/cn";
import React from "react";
import { HomeIcon, User } from "nui-react-icons";
import { usePathname } from "next/navigation";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
export const ButtonNav = ({ className }: { className?: string }) => {
    const pathname = usePathname();

    const nav = [
        {
            icon: <HomeIcon className="h-6 w-6" />,
            label: "Home",
            href: "/",
        },
        {
            icon: <HomeIcon className="h-6 w-6" />,
            label: "Categories",
            href: "/collections",
        },
        {
            icon: <User className="h-6 w-6" viewBox="0 0 20 20" />,
            label: "Account",
            href: "/account/profile",
        },
        {
            icon: <HomeIcon className="h-6 w-6" />,
            label: "Help",
            href: "/support",
        },
    ];

    return (
        <nav className={cn("flex md:hidden z-40 w-full items-center justify-between fixed bottom-0 inset-x-0 py-2 px-8 bg-background", className)}>
            {nav.map((item, index: number) => (
                <LocalizedClientLink
                    key={index}
                    className={cn("flex flex-col items-center", {
                        "text-warning": pathname === item.href,
                    })}
                    href={item.href}
                >
                    {item.icon}
                    <p className="text-sm font-semibold">{item.label}</p>
                </LocalizedClientLink>
            ))}
        </nav>
    );
};
