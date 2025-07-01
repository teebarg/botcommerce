import React from "react";
import { Home, Search, User } from "lucide-react";

import StoreMenuComp from "./store-mobile-menu-drawer";

import { cn } from "@/lib/utils";
import { CartComponent } from "@/components/store/cart/cart-component";
import LocalizedClientLink from "@/components/ui/link";

const ButtonNav = async ({ className }: { className?: string }) => {
    interface NavLink {
        icon: React.ReactNode;
        label: string;
        href: string;
    }

    const nav: NavLink[] = [
        {
            icon: <Home className="h-7 w-7" />,
            label: "Home",
            href: "/",
        },
        {
            icon: <Search className="h-7 w-7" />,
            label: "Shop",
            href: "/collections",
        },
        {
            icon: <User className="h-7 w-7" />,
            label: "Account",
            href: "/account",
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
                    {item.label}
                    {/* <p className="font-semibold">{item.label}</p> */}
                </LocalizedClientLink>
            ))}
            <span className="flex flex-col items-center">
                <CartComponent />
                Cart
            </span>

            <StoreMenuComp />
        </nav>
    );
};

export default ButtonNav;
