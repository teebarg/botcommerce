import { Metadata } from "next";
import React from "react";
import { getCustomer } from "@lib/data";
import UserDropDown from "@modules/account/components/user-menu";
import { Customer } from "types/global";
import { Heart, Home, UserGroup, User, Checkout, Collection } from "nui-react-icons";

import { cn } from "@/lib/util/cn";
import LocalizedClientLink from "@/components/ui/link";

export const metadata: Metadata = {
    title: "Menu",
    description: "Your menu",
};

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

export default async function Menu() {
    const customer: Customer = await getCustomer().catch(() => null);
    const isAdmin: boolean = Boolean(customer?.is_superuser);

    return (
        <div className="flex flex-col px-4 flex-1">
            <div className="mt-6 space-y-3">
                <NavLink href="/" icon={<Home className="h-8 w-8" />} title="Home" />
                <NavLink href="/account/profile" icon={<User className="h-8 w-8" viewBox="0 0 20 20" />} title="Profile" />
                <NavLink href="/collections" icon={<Collection className="h-8 w-8" />} title="Collections" />
                <NavLink href="/checkout" icon={<Checkout className="h-8 w-8" />} title="Checkout" />
                {customer && <NavLink href="/wishlist" icon={<Heart className="h-8 w-8" />} title="Saved Items" />}
                {isAdmin && <NavLink href="/admin" icon={<UserGroup className="h-8 w-8" viewBox="0 0 24 24" />} title="Admin" />}
            </div>

            <hr className="tb-divider my-8" />

            <div className="space-y-3">
                <NavLink href="/our-story" title="Our Story" />
                <NavLink href="/support" title="Contact Us" />
            </div>
            <div className="mt-auto mb-2 md:hidden">
                {customer ? (
                    <UserDropDown customer={customer} />
                ) : (
                    <LocalizedClientLink className="font-semibold leading-6 text-primary-900" href="/sign-in">
                        Log In <span aria-hidden="true">&rarr;</span>
                    </LocalizedClientLink>
                )}
            </div>
        </div>
    );
}
