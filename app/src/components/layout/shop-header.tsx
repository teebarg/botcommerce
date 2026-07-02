import { useEffect, useRef } from "react";
import { Link, useRouteContext } from "@tanstack/react-router";
import { ShoppingBag, Heart, HeartOff, ArrowRight } from "lucide-react";
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
            className="fixed top-0 inset-x-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-md"
        >
            <div className="w-full max-w-7xl mx-auto px-4">
                {/* <div className="flex md:hidden items-center gap-1 py-3 pt-[calc(var(--sat)+12px)] w-full">
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
                </div> */}

                <div className="flex md:hidden items-center justify-between py-2.5 pt-[calc(var(--sat)+10px)] w-full gap-2">
                    {/* Left Utility Wing */}
                    <div className="flex items-center gap-1.5 shrink-0">
                        <BackButton />
                        <Link to="/" className="active:scale-95 transition-transform">
                            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-xs shadow-primary/20">
                                <ShoppingBag className="w-4.5 h-4.5 text-white" />
                            </div>
                        </Link>
                        {/* <MobileFilter /> */}
                    </div>

                    {totalItems > 0 ? (
                        <LocalizedClientLink 
                            href="/checkout"
                            className="flex-1 max-w-[190px] h-9 rounded-full bg-primary text-primary-foreground pl-3 pr-2 flex items-center justify-between gap-1 shadow-sm active:scale-[0.98] transition-all"
                        >
                            <div className="flex flex-col text-left min-w-0">
                                <span className="text-[9px] font-bold uppercase tracking-wider opacity-80 leading-none">Checkout</span>
                                <span className="text-xs font-display font-bold tracking-tight truncate mt-0.5">
                                    {currency(subtotal)} <span className="font-normal opacity-80 font-sans text-[10px]">({totalItems})</span>
                                </span>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 opacity-90" />
                        </LocalizedClientLink>
                    ) : (
                        <span className="flex-1 text-center font-display text-sm font-bold tracking-tight text-foreground truncate px-2">
                            {shop_name}
                        </span>
                    )}
                    <div className="flex items-center gap-1 shrink-0">
                        <SearchDialog />
                        {/* <ShareButton /> */}
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