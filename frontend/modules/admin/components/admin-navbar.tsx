import UserDropDown from "@modules/account/components/user-menu";
import ActivityTray from "@modules/common/components/activity-tray";
import { Navbar as NavigationBar, NavbarBrand, NavbarContent, NavbarItem } from "@components/navbar";
import dynamic from "next/dynamic";

import { siteConfig } from "@/lib/config";
import LocalizedClientLink from "@/components/ui/link";
import { auth } from "@/actions/auth";

const getThemeToggler = () =>
    dynamic(() => import("@lib/theme/theme-button"), {
        loading: () => <div className="w-6 h-6" />,
    });

const AdminNavbar = async () => {
    const user = await auth();
    const ThemeButton = getThemeToggler();

    return (
        <NavigationBar>
            <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
                <NavbarBrand className="gap-3 max-w-fit">
                    <LocalizedClientLink href="/admin">
                        <p className="font-bold text-inherit">{siteConfig.name}</p>
                    </LocalizedClientLink>
                </NavbarBrand>
            </NavbarContent>

            <NavbarContent className="flex basis-1/5 sm:basis-full" justify="end">
                <NavbarItem className="flex">
                    <LocalizedClientLink href="/">Store</LocalizedClientLink>
                </NavbarItem>
                <NavbarItem className="flex items-center gap-2.5">
                    {/* <Notification /> */}
                    <ThemeButton />
                    {user?.id && <ActivityTray userId={user.id} />}
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
