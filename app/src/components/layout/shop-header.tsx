import { useEffect, useRef } from "react";
import { Link, useRouteContext } from "@tanstack/react-router";
import { ShoppingBag, Heart, HeartOff, ArrowRight } from "lucide-react";
import { SearchDialog } from "@/components/store/product-search";
import { CartComponent } from "@/components/store/cart/cart-component";
import { UserDropdown } from "../user-button";
import { ThemeToggle } from "../theme-toggle";
import { BackButton } from "@/components/back";
import GetApp from "@/components/get-app";
import LocalizedClientLink from "@/components/ui/link";
import { useConfig } from "@/providers/store-provider";
import { useCartSummary } from "@/hooks/useCartSummary";
import { currency } from "@/utils";

const StoreNavbar = () => {
    const { isAuthenticated } = useRouteContext({ strict: false });
    const { shop_name } = useConfig();
    const { subtotal, totalItems } = useCartSummary();
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
            className="fixed top-0 inset-x-0 z-50 w-full glass"
        >
            <div className="w-full max-w-7xl mx-auto px-2">
                <div className="flex md:hidden items-center justify-between py-2.5 pt-[calc(var(--sat)+10px)] w-full gap-2">
                    <div className="flex items-center gap-1.5 shrink-0">
                        <BackButton />
                        <Link to="/" className="active:scale-95 transition-transform">
                            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-xs shadow-primary/20">
                                <ShoppingBag className="w-4.5 h-4.5 text-white" />
                            </div>
                        </Link>
                    </div>
                    <div className="flex-1 flex justify-center px-2 min-w-0">
                        {totalItems > 0 ? (
                            <LocalizedClientLink
                                href="/checkout"
                                className="flex items-center gap-0.5 bg-gradient-action rounded-full p-2 max-w-full active:scale-[0.97] transition-transform"
                            >
                                <span className="text-xs font-display font-medium text-primary-foreground whitespace-nowrap">
                                    Checkout
                                </span>
                                <span className="w-[3px] h-[3px] rounded-full bg-primary-foreground/40 shrink-0" />
                                <span className="text-xs font-medium text-primary-foreground/75 whitespace-nowrap">
                                    {currency(subtotal)}
                                </span>
                                <span className="w-6 h-6 rounded-full bg-primary-foreground/15 flex items-center justify-center shrink-0">
                                    <ArrowRight className="w-3.5 h-3.5 text-primary-foreground" />
                                </span>
                            </LocalizedClientLink>
                        ) : (
                            <span className="font-display text-[15px] font-medium tracking-tight text-foreground truncate">
                                {shop_name}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                        {/* <SearchDialog /> */}
                        <GetApp />
                        <UserDropdown />
                    </div>
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

                    {/* <div className="flex-1 max-w-md mx-auto">
                        <SearchDialog />
                    </div> */}

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