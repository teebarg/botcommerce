import { cn } from "@lib/util/cn";
import React from "react";
import { HeartFilled, Home, Search, User } from "nui-react-icons";

import { Cart } from "@/modules/layout/components/cart";
import LocalizedClientLink from "@/components/ui/link";

const ButtonNav = async ({ className }: { className?: string }) => {
    interface NavLink {
        icon: React.ReactNode;
        label: string;
        href: string;
    }

    const nav: NavLink[] = [
        {
            icon: <Home className="h-6 w-6" />,
            label: "Home",
            href: "/",
        },
        {
            icon: <Search className="h-6 w-6" />,
            label: "Shop",
            href: "/collections",
        },
        {
            icon: <Cart />,
            label: "Cart",
            href: "/cart",
        },
        {
            icon: <User className="h-6 w-6" viewBox="0 0 20 20" />,
            label: "Account",
            href: "/account",
        },
        {
            icon: <HeartFilled className="h-6 w-6" />,
            label: "Menu",
            href: "/menu",
        },
    ];

    return (
        <nav
            className={cn(
                "flex md:hidden z-40 w-full items-center justify-between fixed bottom-0 inset-x-0 py-4 px-8 bg-background shadow-xl",
                className
            )}
        >
            {nav.map((item: NavLink, index: number) => (
                <LocalizedClientLink key={index} active="text-rose-600" className={cn("flex flex-col items-center")} href={item.href}>
                    {item.icon}
                    <p className="text-sm font-semibold">{item.label}</p>
                </LocalizedClientLink>
            ))}
        </nav>
    );
};

export default ButtonNav;
