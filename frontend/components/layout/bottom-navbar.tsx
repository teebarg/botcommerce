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
                "flex md:hidden z-40 w-full items-center justify-between fixed bottom-0 inset-x-0 py-4 px-8 bg-background shadow-xl text-xs",
                className
            )}
        >
            {nav.map((item: NavLink, idx: number) => (
                <div key={idx} className="flex flex-col items-center text-xs">
                    <LocalizedClientLink active="bg-primary text-white rounded-xl" className="p-1.5" href={item.href}>
                        {item.icon}
                    </LocalizedClientLink>
                    {item.label}
                </div>
            ))}
            <span className="flex flex-col items-center text-xs">
                <CartComponent />
                Cart
            </span>

            <StoreMenuComp />
        </nav>
    );
};

export default ButtonNav;
