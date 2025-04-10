import React, { Suspense } from "react";
import UserDropDown from "@modules/account/components/user-menu";
import { Cart } from "@modules/layout/components/cart";
import { Navbar as NavigationBar, NavbarBrand, NavbarContent, NavbarItem } from "@components/navbar";
import { HeartFilled, Heart, ShoppingCart } from "nui-react-icons";
import dynamic from "next/dynamic";

import Search from "@/modules/search/components/search";
import LocalizedClientLink from "@/components/ui/link";
import { auth } from "@/actions/auth";
import { getSiteConfig } from "@/lib/config";

const getThemeToggler = () =>
    dynamic(() => import("@lib/theme/theme-button"), {
        loading: () => <div className="w-6 h-6" />,
    });

const Navbar = async () => {
    const user = await auth();
    const ThemeButton = getThemeToggler();
    const siteConfig = await getSiteConfig();

    return (
        <NavigationBar className="my-2 hidden md:flex">
            <NavbarContent className="flex flex-1 max-w-8xl mx-auto">
                <NavbarBrand className="flex items-center flex-1 md:w-[25vw] font-semibold">
                    <LocalizedClientLink className="text-3xl block" href="/">
                        {siteConfig?.name}
                    </LocalizedClientLink>
                    <LocalizedClientLink className="hidden md:block" href={"/collections"}>
                        Collections
                    </LocalizedClientLink>
                    {user?.isAdmin && (
                        <LocalizedClientLink className="hidden md:block" href={"/admin"}>
                            Admin
                        </LocalizedClientLink>
                    )}
                </NavbarBrand>
                <NavbarItem className="hidden md:flex flex-1">
                    <Search className="w-full justify-between" />
                </NavbarItem>
                <NavbarItem className="md:w-[25vw] flex gap-3 justify-end items-center">
                    <Suspense fallback={<ShoppingCart className="w-6 h-6" />}>
                        <Cart />
                    </Suspense>
                    <ThemeButton />
                    <div className="hidden md:flex">
                        {user ? (
                            <LocalizedClientLink aria-label="go to wishlist" href={"/wishlist"}>
                                <HeartFilled className="h-8 w-8 text-primary-500" />
                            </LocalizedClientLink>
                        ) : (
                            <Heart className="h-8 w-8 text-default-500" />
                        )}
                    </div>
                    <div className="hidden sm:flex">
                        {user ? (
                            <UserDropDown user={user} />
                        ) : (
                            <LocalizedClientLink className="text-sm font-semibold leading-6" href="/sign-in">
                                Log In <span aria-hidden="true">&rarr;</span>
                            </LocalizedClientLink>
                        )}
                    </div>
                </NavbarItem>
            </NavbarContent>
        </NavigationBar>
    );
};

export default Navbar;
