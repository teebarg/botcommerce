import React from "react";
import { Navbar as NavigationBar, NavbarBrand, NavbarContent, NavbarItem } from "@components/navbar";
import { HeartFilled, Heart } from "nui-react-icons";
import ThemeButton from "@lib/theme/theme-button";

import GetApp from "../get-app";

import UserDropDown from "./user-dropdown";

import { CartComponent } from "@/components/store/cart/cart-component";
import LocalizedClientLink from "@/components/ui/link";
import { auth } from "@/auth";
import { SearchDialog } from "@/components/store/product-search";
import { getSiteConfig } from "@/lib/config";

const StoreNavbar = async () => {
    const session = await auth();
    const siteConfig = await getSiteConfig();

    return (
        <NavigationBar className="hidden md:flex bg-background py-2">
            <NavbarContent className="flex flex-1 max-w-8xl mx-auto">
                <NavbarBrand className="flex items-center font-semibold">
                    <LocalizedClientLink className="flex items-center gap-1" href="/">
                        <span className="tracking-tighter font-bold text-2xl uppercase">{siteConfig?.name}</span>
                        <div className="h-8 w-8">
                            <img alt="Logo" className="h-full w-full object-contain" src="/icon.png" />
                        </div>
                    </LocalizedClientLink>
                    <LocalizedClientLink className="hidden md:block" href={"/collections"}>
                        Collections
                    </LocalizedClientLink>
                </NavbarBrand>
                <NavbarItem className="hidden md:flex justify-center flex-1">
                    <SearchDialog />
                </NavbarItem>
                <NavbarItem className="flex gap-1.5 justify-end items-center">
                    <CartComponent />
                    <ThemeButton />
                    <div className="hidden md:flex">
                        {session ? (
                            <LocalizedClientLink
                                aria-label="go to wishlist"
                                href={"/wishlist"}
                                className="flex items-center justify-center rounded-md h-10 w-10 hover:bg-accent"
                            >
                                <HeartFilled className="h-7 w-7 text-primary" />
                            </LocalizedClientLink>
                        ) : (
                            <div className="flex items-center justify-center rounded-md h-10 w-10 hover:bg-accent">
                                <Heart className="h-7 w-7 text-muted-foreground" />
                            </div>
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
