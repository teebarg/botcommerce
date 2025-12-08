import { Navbar as NavigationBar, NavbarBrand, NavbarContent, NavbarItem } from "@/components/navbar";
import GetApp from "../get-app";
import UserDropDown from "./user-dropdown";
import { CartComponent } from "@/components/store/cart/cart-component";
import LocalizedClientLink from "@/components/ui/link";
import { SearchDialog } from "@/components/store/product-search";
import { Heart, HeartOff } from "lucide-react";
import { ThemeToggle } from "../theme-toggle";
import { Session } from "start-authjs";
import { useConfig } from "@/providers/store-provider";

const StoreNavbar = ({ session }: { session: Session | null }) => {
    const { config } = useConfig();

    return (
        <NavigationBar className="bg-background py-2">
            <NavbarContent className="flex flex-1 max-w-8xl mx-auto">
                <NavbarBrand className="flex items-center font-semibold">
                    <LocalizedClientLink
                        className="flex items-center gap-1"
                        href="/"
                    >
                        <span className="tracking-tighter font-bold text-2xl uppercase">{config?.shop_name}</span>
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
                    <ThemeToggle />
                    <div className="hidden md:flex">
                        {session ? (
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
                    <div className="hidden sm:flex">
                        {session?.user ? (
                            <UserDropDown user={session?.user} />
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
