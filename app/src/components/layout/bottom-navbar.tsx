import type React from "react";
import { Home, Search, User } from "lucide-react";
import StoreMenuComp from "./store-mobile-menu-drawer";
import { cn } from "@/utils";
import { CartComponent } from "@/components/store/cart/cart-component";
import LocalizedClientLink from "@/components/ui/link";
import { motion } from "framer-motion";

const ButtonNav = ({ className }: { className?: string }) => {
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
                "flex md:hidden z-30 w-full items-center justify-between fixed bottom-0 inset-x-0 py-4 px-8 bg-background shadow-xl text-xs",
                className
            )}
        >
            {nav.map((item: NavLink, idx: number) => (
                <motion.div whileTap={{ scale: 0.9 }} key={idx} className="flex flex-col items-center text-xs relative">
                    <LocalizedClientLink active="bg-primary text-white rounded-xl" aria-label={item.label} className="p-1.5" href={item.href}>
                        {item.icon}
                    </LocalizedClientLink>
                    {item.label}
                    {idx === 0 && <motion.div layoutId="activeTab" className="absolute -top-1 w-1 h-1 rounded-full bg-primary" />}
                </motion.div>
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
