import type React from "react";
import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { Home, Search, User } from "lucide-react";
import StoreMenuComp from "./store-mobile-menu-drawer";
import { CartComponent } from "@/components/store/cart/cart-component";
import { TAB_ITEM_CLASS, TabIcon } from "./TabIcon";

interface NavLink {
    icon: React.ElementType;
    label: string;
    href: string;
    exact?: boolean;
}

const NAV: NavLink[] = [
    { icon: Home, label: "Home", href: "/", exact: true },
    { icon: Search, label: "Shop", href: "/collections" },
    { icon: User, label: "Account", href: "/account" },
];

const ButtonNav = () => {
    const navRef = useRef<HTMLElement>(null);

    // Publish the nav's real height (safe-area included) as --bottom-nav-h so other fixed bars,
    // like the quick-order bar, can sit above it. It reads 0 when the nav is hidden.
    useEffect(() => {
        const el = navRef.current;
        if (!el) return;
        const root = document.documentElement;
        const update = () => root.style.setProperty("--bottom-nav-h", `${el.offsetHeight}px`);
        update();
        const observer = new ResizeObserver(update);
        observer.observe(el);
        return () => {
            observer.disconnect();
            root.style.removeProperty("--bottom-nav-h");
        };
    }, []);

    return (
        <nav
            ref={navRef}
            aria-label="Main"
            className="md:hidden [html[data-quick-order]_&]:hidden fixed bottom-0 inset-x-0 z-40 glass shadow-xl transition-transform duration-300 motion-reduce:transition-none [html[data-chrome-hidden]_&]:translate-y-full"
            style={{ paddingBottom: `calc(var(--sab) + 8px)` }}
        >
            <ul className="flex items-stretch justify-around px-2 pt-2">
                {NAV.map(({ icon: Icon, label, href, exact }) => (
                    <li key={href} className="min-w-0 flex-1">
                        <Link to={href} activeOptions={{ exact }} preload={false} className={TAB_ITEM_CLASS}>
                            <TabIcon>
                                <Icon className="h-7 w-7" />
                            </TabIcon>
                            {label}
                        </Link>
                    </li>
                ))}
                <li className="min-w-0 flex-1">
                    <CartComponent variant="tab" />
                </li>
                <li className="min-w-0 flex-1">
                    <StoreMenuComp />
                </li>
            </ul>
        </nav>
    );
};

export default ButtonNav;
