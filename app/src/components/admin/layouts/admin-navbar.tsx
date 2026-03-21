import { Navbar as NavigationBar, NavbarBrand, NavbarContent, NavbarItem } from "@/components/navbar";
import ActivityTray from "@/components/generic/activities/activity-tray";
import LocalizedClientLink from "@/components/ui/link";
import MenuComp from "@/components/layout/admin-mobile-menu-drawer";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserDropdown } from "@/components/user-button";
import { GalleryFilters } from "../product/gallery-filters";

const AdminNavbar = () => {
    return (
        <NavigationBar className="header-safe bg-background sticky top-0 z-50 flex items-center">
            <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
                <NavbarBrand className="gap-3 max-w-fit hidden sm:block">
                    <LocalizedClientLink href="/admin">
                        <p className="font-bold text-inherit">Admin</p>
                    </LocalizedClientLink>
                </NavbarBrand>
                <MenuComp />
            </NavbarContent>

            <NavbarContent className="flex basis-1/5 sm:basis-full" justify="end">
                <NavbarItem className="flex">
                    <LocalizedClientLink href="/">Store</LocalizedClientLink>
                </NavbarItem>
                <NavbarItem className="flex items-center gap-2.5">
                    {/* <Notification /> */}
                    <GalleryFilters />
                    <ThemeToggle />
                    <ActivityTray />
                </NavbarItem>
                <NavbarItem className="flex">
                    <UserDropdown />
                </NavbarItem>
            </NavbarContent>
        </NavigationBar>
    );
};

export default AdminNavbar;
