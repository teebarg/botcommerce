import { useEffect, useRef } from "react";
import ActivityTray from "@/components/generic/activities/activity-tray";
import LocalizedClientLink from "@/components/ui/link";
import MenuComp from "@/components/layout/admin-mobile-menu-drawer";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserDropdown } from "@/components/user-button";
import { GalleryFilters } from "../product/gallery-filters";

const AdminNavbar = () => {
    const navRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!navRef.current) return;

        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const height = entry.borderBoxSize[0].blockSize;
                document.documentElement.style.setProperty("--admin-nav-height", `${height}px`);
            }
        });

        observer.observe(navRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <header ref={navRef} className="sticky top-[var(--sat)] z-50 w-full glass">
            <div className="flex items-center justify-between h-16 w-full max-w-[1440px] mx-auto px-4 gap-4">
                <div className="flex items-center gap-4">
                    <div className="hidden sm:block">
                        <LocalizedClientLink href="/admin">
                            <p className="font-bold text-lg text-foreground tracking-tight">Admin</p>
                        </LocalizedClientLink>
                    </div>
                    <MenuComp />
                </div>
                <div className="flex items-center gap-4 sm:gap-6">
                    <LocalizedClientLink
                        href="/"
                        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Store
                    </LocalizedClientLink>
                    <div className="flex items-center gap-2.5">
                        <GalleryFilters />
                        <ThemeToggle />
                        <ActivityTray />
                    </div>
                    <div className="flex items-center">
                        <UserDropdown />
                    </div>
                </div>

            </div>
        </header>
    );
};

export default AdminNavbar;
