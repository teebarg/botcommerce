"use client";

import React from "react";
import { CreditCard, Heart, Home, LayoutGrid, User2, User as UserIcon } from "lucide-react";
import { usePathname } from "next/navigation";

import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import LocalizedClientLink from "@/components/ui/link";
import ThemeButton from "@/lib/theme/theme-button";
import { useAuth } from "@/providers/auth-provider";
import { authApi } from "@/apis/auth";
import { useInvalidateMe } from "@/lib/hooks/useUser";
import { signOut } from "next-auth/react";

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

const Menu: React.FC = () => {
    const pathname = usePathname();
    const { user } = useAuth();
    const invalidate = useInvalidateMe();
    const handleLogout = async () => {
        await authApi.logOut();
        await signOut();
        invalidate();
        // window.location.href = "/";
    };

    return (
        <div className="flex flex-col py-4 px-4 flex-1">
            <div className="space-y-3">
                <NavLink href="/" icon={<Home className="h-6 w-6" />} title="Home" />
                <NavLink href="/account/profile" icon={<UserIcon className="h-6 w-6" />} title="Profile" />
                <NavLink href="/collections" icon={<LayoutGrid className="h-6 w-6" />} title="Collections" />
                <NavLink href="/checkout" icon={<CreditCard className="h-6 w-6" />} title="Checkout" />
                {user && <NavLink href="/wishlist" icon={<Heart className="h-6 w-6" />} title="Favorites" />}
                {user?.role === "ADMIN" && <NavLink href="/admin" icon={<User2 className="h-6 w-6" />} title="Admin" />}
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
                    <LocalizedClientLink className="font-semibold leading-6 text-primary-900" href={`/sign-in?callbackUrl=${pathname}`}>
                        Log In <span aria-hidden="true">&rarr;</span>
                    </LocalizedClientLink>
                )}
            </div>
        </div>
    );
};

export default Menu;
