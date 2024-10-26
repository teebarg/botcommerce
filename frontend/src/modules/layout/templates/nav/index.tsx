import React, { Suspense } from "react";
import { getCustomer } from "@lib/data";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { Navbar as NextUINavbar, NavbarContent, NavbarMenu, NavbarMenuToggle, NavbarBrand, NavbarItem, NavbarMenuItem } from "@nextui-org/navbar";
import { siteConfig } from "@lib/config";
import UserDropDown from "@modules/account/components/user-menu";
import { Cart } from "@modules/layout/components/cart";
import Search from "@modules/search/templates/search";
import { Customer } from "types/global";
import { getThemeToggler } from "@lib/theme/get-theme-button";

const Navbar = async () => {
    const customer: Customer = await getCustomer().catch(() => null);
    const isAdmin: boolean = Boolean(customer?.is_superuser);
    const ThemeButton = getThemeToggler();

    return (
        <NextUINavbar className="my-2" maxWidth="full" position="sticky">
            <NavbarContent className="basis-1/5 sm:basis-full flex" justify="start">
                <NavbarBrand as="li" className="gap-3 max-w-fit">
                    <LocalizedClientLink className="flex justify-start items-center gap-1" href="/">
                        <p className="font-bold text-inherit text-2xl">Botcommerce</p>
                    </LocalizedClientLink>
                </NavbarBrand>
                <div className="hidden sm:flex gap-2">
                    <NavbarMenuItem>
                        <LocalizedClientLink className="text-base font-medium" href={"/"}>
                            Home
                        </LocalizedClientLink>
                    </NavbarMenuItem>
                    <NavbarMenuItem>
                        <LocalizedClientLink className="text-base font-medium" href={"/collections"}>
                            Collections
                        </LocalizedClientLink>
                    </NavbarMenuItem>
                    <NavbarMenuItem>
                        <LocalizedClientLink className="text-base font-medium" href={"/cart"}>
                            Cart
                        </LocalizedClientLink>
                    </NavbarMenuItem>
                    <NavbarMenuItem>
                        <LocalizedClientLink className="text-base font-medium" href={"/checkout"}>
                            Checkout
                        </LocalizedClientLink>
                    </NavbarMenuItem>
                    {isAdmin && (
                        <NavbarMenuItem>
                            <LocalizedClientLink className="text-base font-medium" href={"/admin"}>
                                Admin
                            </LocalizedClientLink>
                        </NavbarMenuItem>
                    )}
                </div>
            </NavbarContent>

            <NavbarContent className="flex basis-1/5 sm:basis-full" justify="end">
                <NavbarItem className="flex items-center">
                    <ThemeButton />
                </NavbarItem>
                <NavbarItem className="hidden lg:flex">
                    <Search />
                </NavbarItem>
                <NavbarItem className="flex items-center pt-2">
                    <Suspense
                        fallback={
                            <LocalizedClientLink className="hover:text-default-800 flex gap-2" data-testid="nav-cart-link" href="/cart">
                                Cart (0)
                            </LocalizedClientLink>
                        }
                    >
                        <Cart />
                    </Suspense>
                </NavbarItem>
                <NavbarItem className="hidden sm:flex">
                    {customer ? (
                        <UserDropDown customer={customer} />
                    ) : (
                        <LocalizedClientLink className="text-sm font-semibold leading-6" href="/sign-in">
                            Log In <span aria-hidden="true">&rarr;</span>
                        </LocalizedClientLink>
                    )}
                </NavbarItem>
                <NavbarMenuToggle className="sm:hidden" />
            </NavbarContent>
            <NavbarMenu className="pt-7">
                <Search />
                <div className="mx-4 mt-2 flex flex-col gap-2">
                    {siteConfig.navItems.map((item: any, index: number) => (
                        <NavbarMenuItem key={`${item}-${index}`}>
                            <LocalizedClientLink className="" href={item.href}>
                                {item.label}
                            </LocalizedClientLink>
                        </NavbarMenuItem>
                    ))}
                </div>
            </NavbarMenu>
        </NextUINavbar>
    );
};

export default Navbar;
