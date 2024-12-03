import React, { Suspense } from "react";
import { getCustomer } from "@lib/data";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { siteConfig } from "@lib/config";
import UserDropDown from "@modules/account/components/user-menu";
import { Cart } from "@modules/layout/components/cart";
import Search from "@modules/search/templates/search";
import { Customer } from "types/global";
import { getThemeToggler } from "@lib/theme/get-theme-button";
import { Navbar as NavigationBar, NavbarBrand, NavbarContent, NavbarMenuToggle, NavbarItem, NavbarMenu } from "@components/navbar";
import { HeartFilledIcon, HeartIcon } from "nui-react-icons";

const Navbar = async () => {
    const customer: Customer = await getCustomer().catch(() => null);
    const isAdmin: boolean = Boolean(customer?.is_superuser);
    const ThemeButton = getThemeToggler();

    return (
        <NavigationBar className="my-2">
            <NavbarContent className="flex flex-1 max-w-7xl mx-auto">
                <NavbarBrand className="w-[25vw]">
                    <LocalizedClientLink className="flex justify-start items-center gap-1" href="/">
                        <p className="font-bold text-inherit text-2xl">Botcommerce</p>
                    </LocalizedClientLink>
                    <LocalizedClientLink className="text-base font-medium" href={"/collections"}>
                        Collections
                    </LocalizedClientLink>
                    {isAdmin && (
                        <LocalizedClientLink className="text-base font-medium" href={"/admin"}>
                            Admin
                        </LocalizedClientLink>
                    )}
                </NavbarBrand>
                <div className="hidden sm:flex items-center gap-2 flex-1">
                    <NavbarItem className="hidden lg:flex flex-1">
                        <Search className="w-full justify-between" />
                    </NavbarItem>
                </div>
                <div className="w-[25vw] flex gap-4 justify-end">
                    <NavbarItem className="flex items-center">
                        <ThemeButton />
                    </NavbarItem>
                    <NavbarItem className="flex items-center">
                        {customer ? (
                            <LocalizedClientLink className="" href={"/wishlist"}>
                                <HeartFilledIcon className="h-8 w-8 text-primary-500" />
                            </LocalizedClientLink>
                        ) : (
                            <HeartIcon className="h-8 w-8" />
                        )}
                    </NavbarItem>
                    <NavbarItem className="flex items-center pt-2">
                        <Suspense
                            fallback={
                                <LocalizedClientLink className="hover:text-default-900 flex gap-2" data-testid="nav-cart-link" href="/cart">
                                    Cart (0)
                                </LocalizedClientLink>
                            }
                        >
                            <Cart />
                        </Suspense>
                    </NavbarItem>
                    <NavbarItem className="hidden sm:flex items-center">
                        {customer ? (
                            <UserDropDown customer={customer} />
                        ) : (
                            <LocalizedClientLink className="text-sm font-semibold leading-6" href="/sign-in">
                                Log In <span aria-hidden="true">&rarr;</span>
                            </LocalizedClientLink>
                        )}
                    </NavbarItem>
                    <NavbarMenuToggle className="sm:hidden" />
                </div>
            </NavbarContent>
            <NavbarMenu>
                <Search />
                <div className="mx-4 mt-2 flex flex-col gap-2">
                    {siteConfig.navItems.map((item: any, index: number) => (
                        <NavbarItem key={`${item}-${index}`}>
                            <LocalizedClientLink className="" href={item.href}>
                                {item.label}
                            </LocalizedClientLink>
                        </NavbarItem>
                    ))}
                </div>
            </NavbarMenu>
        </NavigationBar>
    );
};

export default Navbar;
