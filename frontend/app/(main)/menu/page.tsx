import { Metadata } from "next";
import React, { Suspense } from "react";
import { getCustomer } from "@lib/data";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import UserDropDown from "@modules/account/components/user-menu";
import { Customer } from "types/global";
import { Heart, Home, UserGroup, User, Checkout, Collection } from "nui-react-icons";

import Search from "@/modules/search/components/search";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/util/cn";

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
        <div className="px-4">
            <div className="mt-6 space-y-3">
                <NavLink icon={<Home className="h-8 w-8" />} title="Home" href="/" />
                <NavLink icon={<User className="h-8 w-8" viewBox="0 0 20 20" />} title="Profile" href="/account/profile" />
                <NavLink icon={<Collection className="h-8 w-8" />} title="Collections" href="/collections" />
                <NavLink icon={<Checkout className="h-8 w-8" />} title="Checkout" href="/checkout" />
                {customer && <NavLink icon={<Heart className="h-8 w-8" />} title="Saved Items" href="/wishlist" />}
                {isAdmin && <NavLink icon={<UserGroup className="h-8 w-8" viewBox="0 0 24 24" />} title="Admin" href="/admin" />}
            </div>

            <hr className="tb-divider my-4" />

            <div className="space-y-3">
                <NavLink title="Our Story" href="/our-story" />
                <NavLink title="Contact Us" href="/support" />
            </div>
            <div className="mt-8 mb-2 md:hidden">
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
