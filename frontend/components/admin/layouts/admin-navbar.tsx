import UserDropDown from "@modules/account/components/user-menu";
import { Navbar as NavigationBar, NavbarBrand, NavbarContent, NavbarItem } from "@components/navbar";
import ThemeToggle from "@lib/theme/theme-button";

import ActivityTray from "@/components/generic/activities/activity-tray";
import { getSiteConfig } from "@/lib/config";
import LocalizedClientLink from "@/components/ui/link";
import { auth } from "@/actions/auth";
import MenuComp from "@/components/layout/admin-mobile-menu-drawer";

const AdminNavbar = async () => {
    const siteConfig = await getSiteConfig();
    const user = await auth();

    return (
        <NavigationBar>
            <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
                <NavbarBrand className="gap-3 max-w-fit hidden sm:block">
                    <LocalizedClientLink href="/admin">
                        <p className="font-bold text-inherit">{siteConfig.name}</p>
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
                    {user ? (
                        <UserDropDown user={user} />
                    ) : (
                        <LocalizedClientLink href="/sign-in">
                            Log In <span aria-hidden="true">&rarr;</span>
                        </LocalizedClientLink>
                    )}
                </NavbarItem>
            </NavbarContent>
        </NavigationBar>
    );
};

export default AdminNavbar;
