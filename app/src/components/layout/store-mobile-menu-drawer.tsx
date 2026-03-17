import { useEffect } from "react";
import { useOverlayTriggerState } from "react-stately";
import { MenuIcon } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useRouteContext } from "@tanstack/react-router";
import { cn } from "@/utils";
import type React from "react";
import { CreditCard, Heart, Home, LayoutGrid, User2, User as UserIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "../theme-toggle";
import { SignInButton, UserButton } from "@clerk/tanstack-react-start";

interface NavLinkProp {
    href: string;
    title: string;
    icon?: React.ReactNode;
    className?: string;
}

const NavLink: React.FC<NavLinkProp> = ({ href = "", title, icon, className }) => {
    return (
        <div className={cn("flex items-center gap-2", className)}>
            {icon}
            <Link to={href}>{title}</Link>
        </div>
    );
};

const StoreMenuComp: React.FC = () => {
    const location = useLocation();
    const pathname = location.pathname;
    const state = useOverlayTriggerState({});
    const { session, isAuthenticated } = useRouteContext({ strict: false });

    useEffect(() => {
        state.close();
    }, [pathname]);

    return (
        <Drawer open={state.isOpen} onOpenChange={state.setOpen}>
            <DrawerTrigger asChild>
                <div aria-label="Menu" className="flex flex-col items-center">
                    <Button size="icon" variant="ghost">
                        <MenuIcon className="h-7 w-7" />
                    </Button>
                    <p className="text-xs">Menu</p>
                </div>
            </DrawerTrigger>
            <DrawerContent aria-describedby={undefined} className="drawer-safe">
                <DrawerHeader className="sr-only">
                    <DrawerTitle>Menu</DrawerTitle>
                </DrawerHeader>
                <div className="flex flex-col py-4 px-4 flex-1">
                    <div className="space-y-3">
                        <NavLink href="/" icon={<Home className="h-6 w-6" />} title="Home" />
                        <NavLink href="/account/profile" icon={<UserIcon className="h-6 w-6" />} title="Profile" />
                        <NavLink href="/collections" icon={<LayoutGrid className="h-6 w-6" />} title="Collections" />
                        <NavLink href="/checkout" icon={<CreditCard className="h-6 w-6" />} title="Checkout" />
                        {isAuthenticated && <NavLink href="/wishlist" icon={<Heart className="h-6 w-6" />} title="Favorites" />}
                        {session?.user?.isAdmin && <NavLink href="/admin" icon={<User2 className="h-6 w-6" />} title="Admin" />}
                    </div>

                    <Separator className="my-8" />

                    <div className="space-y-3">
                        <NavLink href="/about" title="About" />
                        <NavLink href="/support" title="Contact Us" />
                    </div>
                    <div className="mt-8">
                        <ThemeToggle />
                    </div>
                    <div className="mt-4 mb-2 block md:hidden">
                        {isAuthenticated ? <UserButton /> : <SignInButton />}
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
};

export default StoreMenuComp;
