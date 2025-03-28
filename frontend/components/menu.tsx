import React from "react";
import UserDropDown from "@modules/account/components/user-menu";
import { Heart, UserGroup, User, Collection, Checkout } from "nui-react-icons";
import { Home } from "lucide-react";

import { cn } from "@/lib/util/cn";
import LocalizedClientLink from "@/components/ui/link";
import { Session } from "@/types/models";

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
    return (
        <div className="flex flex-col py-6 px-4 flex-1">
            <div className="mt-6 space-y-3">
                <NavLink href="/" icon={<Home className="h-8 w-8" />} title="Home" />
                <NavLink href="/account/profile" icon={<User className="h-8 w-8" viewBox="0 0 20 20" />} title="Profile" />
                <NavLink href="/collections" icon={<Collection className="h-8 w-8" />} title="Collections" />
                <NavLink href="/checkout" icon={<Checkout className="h-8 w-8" />} title="Checkout" />
                {user && <NavLink href="/wishlist" icon={<Heart className="h-8 w-8" />} title="Favorites" />}
                {user?.isAdmin && <NavLink href="/admin" icon={<UserGroup className="h-8 w-8" viewBox="0 0 24 24" />} title="Admin" />}
            </div>

            <hr className="tb-divider my-8" />

            <div className="space-y-3">
                <NavLink href="/our-story" title="Our Story" />
                <NavLink href="/support" title="Contact Us" />
            </div>
            <div className="mt-8 mb-2 md:hidden">
                {user ? (
                    <UserDropDown user={user} />
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
