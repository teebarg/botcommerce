import UserDropDown from "@modules/account/components/user-menu";
import { Navbar as NavigationBar, NavbarBrand, NavbarContent, NavbarItem } from "@components/navbar";
import dynamic from "next/dynamic";
import { MenuIcon } from "lucide-react";

import ActivityTray from "@/components/generic/activities/activity-tray";
import { getSiteConfig } from "@/lib/config";
import LocalizedClientLink from "@/components/ui/link";
import { auth } from "@/actions/auth";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import AdminMobileMenu from "@/components/admin/layouts/mobile-menu";

const getThemeToggler = () =>
    dynamic(() => import("@lib/theme/theme-button"), {
        loading: () => <div className="w-6 h-6" />,
    });

const AdminNavbar = async () => {
    const siteConfig = await getSiteConfig();
    const user = await auth();
    const ThemeButton = getThemeToggler();

    return (
        <NavigationBar>
            <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
                <NavbarBrand className="gap-3 max-w-fit hidden sm:block">
                    <LocalizedClientLink href="/admin">
                        <p className="font-bold text-inherit">{siteConfig.name}</p>
                    </LocalizedClientLink>
                </NavbarBrand>
                <Drawer>
                    <DrawerTrigger className="md:hidden">
                        <MenuIcon className="h-8 w-8" />
                    </DrawerTrigger>
                    <DrawerContent>
                        <DrawerHeader>
                            <DrawerTitle className="sr-only">Menu</DrawerTitle>
                        </DrawerHeader>
                        <AdminMobileMenu />
                    </DrawerContent>
                </Drawer>
            </NavbarContent>

            <NavbarContent className="flex basis-1/5 sm:basis-full" justify="end">
                <NavbarItem className="flex">
                    <LocalizedClientLink href="/">Store</LocalizedClientLink>
                </NavbarItem>
                <NavbarItem className="flex items-center gap-2.5">
                    {/* <Notification /> */}
                    <ThemeButton />
                    <ActivityTray />
                </NavbarItem>
                <NavbarItem className="flex">
                    {user ? (
                        <UserDropDown size="sm" user={user} />
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
