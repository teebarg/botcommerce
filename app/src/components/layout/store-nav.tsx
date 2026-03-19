import { Navbar as NavigationBar, NavbarBrand, NavbarContent, NavbarItem } from "@/components/navbar";
import GetApp from "../get-app";
import { CartComponent } from "@/components/store/cart/cart-component";
import LocalizedClientLink from "@/components/ui/link";
import { SearchDialog } from "@/components/store/product-search";
import { Heart, HeartOff, ShoppingBag } from "lucide-react";
import { ThemeToggle } from "../theme-toggle";
import { useConfig } from "@/providers/store-provider";
import { useRouteContext } from "@tanstack/react-router";
import { UserDropdown } from "../user-button";

const StoreNavbar = () => {
    const { isAuthenticated } = useRouteContext({ strict: false });
    const { config } = useConfig();

    return (
        <NavigationBar className="bg-background py-2 hidden md:block sticky top-0 z-50">
            <NavbarContent className="flex flex-1 max-w-8xl mx-auto">
                <NavbarBrand className="flex items-center font-semibold">
                    <LocalizedClientLink href="/" className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
                            <ShoppingBag className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-display text-xl font-semibold text-foreground hidden sm:block">{config?.shop_name}</span>
                    </LocalizedClientLink>
                    <LocalizedClientLink className="hidden md:block" href="/collections">
                        Explore
                    </LocalizedClientLink>
                </NavbarBrand>
                <NavbarItem className="hidden md:flex justify-center flex-1">
                    <SearchDialog />
                </NavbarItem>
                <NavbarItem className="flex gap-1.5 justify-end items-center">
                    <CartComponent />
                    <ThemeToggle />
                    <div className="hidden md:flex">
                        {isAuthenticated ? (
                            <LocalizedClientLink
                                aria-label="go to wishlist"
                                className="flex items-center justify-center rounded-md h-10 w-10 hover:bg-accent"
                                href={"/wishlist"}
                            >
                                <Heart className="h-7 w-7 text-primary" />
                            </LocalizedClientLink>
                        ) : (
                            <div className="flex items-center justify-center rounded-md h-10 w-10 hover:bg-accent">
                                <HeartOff className="h-7 w-7 text-muted-foreground" />
                            </div>
                        )}
                    </div>
                    <GetApp />
                    <div className="hidden sm:block">
                        <UserDropdown />
                    </div>
                </NavbarItem>
            </NavbarContent>
        </NavigationBar>
    );
};

export default StoreNavbar;
