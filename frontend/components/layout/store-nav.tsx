import React from "react";
import { Navbar as NavigationBar, NavbarBrand, NavbarContent, NavbarItem } from "@components/navbar";
import { HeartFilled, Heart } from "nui-react-icons";
import ThemeButton from "@lib/theme/theme-button";

import GetApp from "../get-app";

import UserDropDown from "./user-dropdown";

import { CartComponent } from "@/components/store/cart/cart-component";
import Search from "@/components/store/search";
import LocalizedClientLink from "@/components/ui/link";
import { getSiteConfig } from "@/lib/config";
import { auth } from "@/auth";

const StoreNavbar = async () => {
    const session = await auth();
    const siteConfig = await getSiteConfig();

    return (
        <NavigationBar className="my-2 hidden md:flex">
            <NavbarContent className="flex flex-1 max-w-8xl mx-auto">
                <NavbarBrand className="flex items-center font-semibold">
                    <LocalizedClientLink className="text-3xl block" href="/">
                        {siteConfig?.name}
                    </LocalizedClientLink>
                    <LocalizedClientLink className="hidden md:block" href={"/collections"}>
                        Collections
                    </LocalizedClientLink>
                </NavbarBrand>
                <NavbarItem className="hidden md:flex justify-center flex-1">
                    <Search className="w-full justify-between max-w-lg" />
                </NavbarItem>
                <NavbarItem className="flex gap-3 justify-end items-center">
                    <CartComponent />
                    <ThemeButton />
                    <div className="hidden md:flex">
                        {session ? (
                            <LocalizedClientLink aria-label="go to wishlist" href={"/wishlist"}>
                                <HeartFilled className="h-8 w-8 text-accent" />
                            </LocalizedClientLink>
                        ) : (
                            <Heart className="h-8 w-8 text-muted-foreground" />
                        )}
                    </div>
                    <GetApp />
                    <div className="hidden sm:flex">
                        {session ? (
                            <UserDropDown user={session.user} />
                        ) : (
                            <LocalizedClientLink className="text-sm font-semibold leading-6" href="/auth/signin">
                                Log In <span aria-hidden="true">&rarr;</span>
                            </LocalizedClientLink>
                        )}
                    </div>
                </NavbarItem>
            </NavbarContent>
        </NavigationBar>
    );
};

export default StoreNavbar;
