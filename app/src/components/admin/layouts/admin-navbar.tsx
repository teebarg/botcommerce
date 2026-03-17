import { Navbar as NavigationBar, NavbarBrand, NavbarContent, NavbarItem } from "@/components/navbar";
import ActivityTray from "@/components/generic/activities/activity-tray";
import LocalizedClientLink from "@/components/ui/link";
import MenuComp from "@/components/layout/admin-mobile-menu-drawer";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserButton } from "@clerk/tanstack-react-start";

const AdminNavbar = () => {
    return (
        <NavigationBar className="header-safe pb-2 bg-background bg-red-500 sticky top-0 z-50">
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
                    <ThemeToggle />
                    <ActivityTray />
                </NavbarItem>
                <NavbarItem className="flex">
                    <UserButton />
                </NavbarItem>
            </NavbarContent>
        </NavigationBar>
    );
};

export default AdminNavbar;
