import { Navbar as NavigationBar, NavbarBrand, NavbarContent, NavbarItem } from "@components/navbar";
import ThemeToggle from "@lib/theme/theme-button";

import ActivityTray from "@/components/generic/activities/activity-tray";
import { getSiteConfig } from "@/lib/config";
import LocalizedClientLink from "@/components/ui/link";
import MenuComp from "@/components/layout/admin-mobile-menu-drawer";
import UserDropDown from "@/components/layout/user-dropdown";
import { auth } from "@/auth";

const AdminNavbar = async () => {
    const siteConfig = await getSiteConfig();
    const session = await auth();

    return (
        <NavigationBar className="h-16 bg-content2">
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
                    {session?.user ? (
                        <UserDropDown user={session.user} />
                    ) : (
                        <LocalizedClientLink href="/auth/signin">
                            Log In <span aria-hidden="true">&rarr;</span>
                        </LocalizedClientLink>
                    )}
                </NavbarItem>
            </NavbarContent>
        </NavigationBar>
    );
};

export default AdminNavbar;
