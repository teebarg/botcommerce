import React, { Suspense } from "react";
import { getCustomer } from "@lib/data";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import UserDropDown from "@modules/account/components/user-menu";
import { Cart } from "@modules/layout/components/cart";
import { Customer } from "types/global";
import { Navbar as NavigationBar, NavbarBrand, NavbarContent, NavbarMenuToggle, NavbarItem, NavbarMenu } from "@components/navbar";
import { HeartFilled, Heart, Home, UserGroup, User, Checkout, Collection } from "nui-react-icons";
import dynamic from "next/dynamic";

import Search from "@/modules/search/components/search";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/util/cn";

const getThemeToggler = () =>
    dynamic(() => import("@lib/theme/theme-button"), {
        ssr: false,
        loading: () => <div className="w-6 h-6" />,
    });

interface NavLinkProp {
    href: string;
    title: string;
    icon?: React.ReactNode;
    className?: string;
}

const NavLink: React.FC<NavLinkProp> = ({ href = "", title, icon, className }) => {
    return (
        <NavbarItem className={cn("flex items-center gap-2", className)}>
            {icon}
            <LocalizedClientLink href={href}>{title}</LocalizedClientLink>
        </NavbarItem>
    );
};

const Navbar = async () => {
    const customer: Customer = await getCustomer().catch(() => null);
    const isAdmin: boolean = Boolean(customer?.is_superuser);
    const ThemeButton = getThemeToggler();

    return (
        <NavigationBar className="my-2 hidden md:flex">
            <NavbarContent className="flex flex-1 max-w-8xl mx-auto">
                <NavbarBrand className="flex items-center flex-1 md:w-[25vw] font-semibold">
                    <LocalizedClientLink className="text-3xl block" href="/">
                        {siteConfig.name}
                    </LocalizedClientLink>
                    <LocalizedClientLink className="hidden md:block" href={"/collections"}>
                        Collections
                    </LocalizedClientLink>
                    {isAdmin && (
                        <LocalizedClientLink className="hidden md:block" href={"/admin"}>
                            Admin
                        </LocalizedClientLink>
                    )}
                </NavbarBrand>
                <NavbarItem className="hidden md:flex flex-1">
                    <Search className="w-full justify-between" />
                </NavbarItem>
                <NavbarItem className="md:w-[25vw] flex gap-3 justify-end items-center">
                    <Suspense
                        fallback={
                            <LocalizedClientLink className="hover:text-default-900" data-testid="nav-cart-link" href="/cart">
                                Cart (0)
                            </LocalizedClientLink>
                        }
                    >
                        <Cart />
                    </Suspense>
                    <ThemeButton />
                    <div className="hidden md:flex">
                        {customer ? (
                            <LocalizedClientLink aria-label="go to wishlist" href={"/wishlist"}>
                                <HeartFilled className="h-8 w-8 text-primary-500" />
                            </LocalizedClientLink>
                        ) : (
                            <Heart className="h-8 w-8 text-default-500" />
                        )}
                    </div>
                    <div className="hidden sm:flex">
                        {customer ? (
                            <UserDropDown customer={customer} />
                        ) : (
                            <LocalizedClientLink className="text-sm font-semibold leading-6" href="/sign-in">
                                Log In <span aria-hidden="true">&rarr;</span>
                            </LocalizedClientLink>
                        )}
                    </div>
                    <NavbarMenuToggle className="sm:hidden" />
                </NavbarItem>
            </NavbarContent>
            <NavbarMenu>
                <Search className="px-0" />
                <div className="mt-6 space-y-2">
                    <NavLink icon={<Home className="h-8 w-8" />} title="Home" href="/" />
                    <NavLink icon={<User className="h-8 w-8" viewBox="0 0 20 20" />} title="Profile" href="/account/profile" />
                    <NavLink icon={<Collection className="h-8 w-8" />} title="Collections" href="/collections" />
                    <NavLink icon={<Checkout className="h-8 w-8" />} title="Checkout" href="/checkout" />
                    {customer && <NavLink icon={<Heart className="h-8 w-8" />} title="Saved Items" href="/wishlist" />}
                    {isAdmin && <NavLink icon={<UserGroup className="h-8 w-8" viewBox="0 0 24 24" />} title="Admin" href="/admin" />}
                </div>

                <hr className="tb-divider my-4" />

                <div className="space-y-2">
                    <NavLink title="Our Story" href="/our-story" />
                    <NavLink title="Contact Us" href="/support" />
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
            </NavbarMenu>
        </NavigationBar>
    );
};

export default Navbar;
