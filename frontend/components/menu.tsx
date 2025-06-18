import React from "react";
import { UserGroup, Collection, Checkout } from "nui-react-icons";
import { Heart, Home, User } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import LocalizedClientLink from "@/components/ui/link";
import { Session } from "@/schemas";
import ThemeButton from "@/lib/theme/theme-button";
import { api } from "@/apis";

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
            <LocalizedClientLink href={href}>{title}</LocalizedClientLink>
        </div>
    );
};

interface MenuProp {
    user: Session | null;
}

const Menu: React.FC<MenuProp> = ({ user }) => {
    const handleLogout = async () => {
        await api.auth.logOut();
        window.location.href = "/";
    };
    return (
        <div className="flex flex-col py-4 px-4 flex-1">
            <div className="space-y-3">
                <NavLink href="/" icon={<Home className="h-8 w-8" />} title="Home" />
                <NavLink href="/account/profile" icon={<User className="h-8 w-8" viewBox="0 0 20 20" />} title="Profile" />
                <NavLink href="/collections" icon={<Collection className="h-8 w-8" />} title="Collections" />
                <NavLink href="/checkout" icon={<Checkout className="h-8 w-8" />} title="Checkout" />
                {user && <NavLink href="/wishlist" icon={<Heart className="h-8 w-8" />} title="Favorites" />}
                {user?.isAdmin && <NavLink href="/admin" icon={<UserGroup className="h-8 w-8" viewBox="0 0 24 24" />} title="Admin" />}
            </div>

            <Separator className="my-8" />

            <div className="space-y-3">
                <NavLink href="/about" title="About" />
                <NavLink href="/support" title="Contact Us" />
            </div>
            <div className="mt-8">
                <ThemeButton />
            </div>
            <div className="mt-4 mb-2 block md:hidden">
                {user ? (
                    <div>
                        <p className="font-semibold leading-6 text-primary-900">Logged in as {user?.first_name}</p>
                        <button aria-label="log out" data-testid="logout-button" type="button" onClick={handleLogout}>
                            Log out
                        </button>
                    </div>
                ) : (
                    <LocalizedClientLink className="font-semibold leading-6 text-primary-900" href="/sign-in">
                        Log In <span aria-hidden="true">&rarr;</span>
                    </LocalizedClientLink>
                )}
            </div>
        </div>
    );
};

export default Menu;
