import { useEffect, useRef } from "react";
import { Link, useRouteContext } from "@tanstack/react-router";
import { ShoppingBag, Heart, HeartOff } from "lucide-react";
import { SearchDialog } from "@/components/store/product-search";
import { CartComponent } from "@/components/store/cart/cart-component";
import { UserDropdown } from "../user-button";
import { ThemeToggle } from "../theme-toggle";
import { BackButton } from "@/components/back";
import MobileFilter from "@/components/store/mobile-filter";
import ShareButton from "../share";
import GetApp from "@/components/get-app";
import LocalizedClientLink from "@/components/ui/link";
import { useConfig } from "@/providers/store-provider";

const StoreNavbar = () => {
    const { isAuthenticated } = useRouteContext({ strict: false });
    const { shop_name } = useConfig();
    const navRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!navRef.current) return;

        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const height = entry.borderBoxSize[0].blockSize;
                document.documentElement.style.setProperty("--nav-height", `${height}px`);
            }
        });
        observer.observe(navRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <header
            ref={navRef}
            className="fixed top-0 inset-x-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-md"
        >
            <div className="w-full max-w-7xl mx-auto px-4">
                <div className="flex md:hidden items-center gap-1 py-3 pt-[calc(var(--sat)+12px)] w-full">
                    <div className="flex gap-2 items-center flex-1">
                        <BackButton />
                        <Link to="/">
                            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                                <ShoppingBag className="w-5 h-5 text-white" />
                            </div>
                        </Link>
                        <MobileFilter />
                    </div>
                    <ShareButton />
                    <SearchDialog />
                    <GetApp />
                    <UserDropdown />
                </div>

                <div className="hidden md:flex items-center justify-between h-16 w-full gap-4">
                    <div className="flex items-center gap-6">
                        <LocalizedClientLink href="/" className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                                <ShoppingBag className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-display text-xl font-semibold text-foreground hidden sm:block">
                                {shop_name}
                            </span>
                        </LocalizedClientLink>

                        <LocalizedClientLink className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" href="/collections">
                            Explore
                        </LocalizedClientLink>
                    </div>

                    <div className="flex-1 max-w-md mx-auto">
                        <SearchDialog />
                    </div>

                    <div className="flex gap-3 items-center">
                        <CartComponent />
                        <ThemeToggle />

                        <div className="flex">
                            {isAuthenticated ? (
                                <LocalizedClientLink
                                    aria-label="go to wishlist"
                                    className="flex items-center justify-center rounded-md h-10 w-10 hover:bg-accent text-primary"
                                    href={"/wishlist"}
                                >
                                    <Heart className="h-5 w-5" />
                                </LocalizedClientLink>
                            ) : (
                                <div className="flex items-center justify-center rounded-md h-10 w-10 hover:bg-accent text-muted-foreground">
                                    <HeartOff className="h-5 w-5" />
                                </div>
                            )}
                        </div>
                        <GetApp />
                        <div className="flex items-center">
                            <UserDropdown />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default StoreNavbar;