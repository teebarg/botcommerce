import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { getCustomer } from "@lib/data";
import UserDropDown from "@modules/account/components/user-menu";
import { siteConfig } from "@lib/config";
import ActivityTray from "@modules/common/components/activity-tray";
import { getThemeToggler } from "@lib/theme/get-theme-button";
import { Navbar as NavigationBar, NavbarBrand, NavbarContent, NavbarMenuToggle, NavbarItem, NavbarMenu } from "@components/navbar";

const AdminNavbar = async () => {
    const customer = await getCustomer().catch(() => null);
    const ThemeButton = getThemeToggler();

    return (
        <NavigationBar>
            <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
                <NavbarBrand className="gap-3 max-w-fit">
                    <LocalizedClientLink className="flex justify-start items-center gap-1" href="/admin">
                        <p className="font-bold text-inherit">Botcommerce</p>
                    </LocalizedClientLink>
                </NavbarBrand>
            </NavbarContent>

            <NavbarContent className="flex basis-1/5 sm:basis-full" justify="end">
                <NavbarItem className="flex">
                    <LocalizedClientLink className="text-sm font-semibold leading-6" href="/">
                        Store
                    </LocalizedClientLink>
                </NavbarItem>
                <NavbarItem className="flex items-center gap-2.5">
                    {/* <Notification /> */}
                    <ThemeButton />
                    <ActivityTray customer={customer} />
                </NavbarItem>
                <NavbarItem className="flex">
                    {customer ? (
                        <UserDropDown customer={customer} />
                    ) : (
                        <LocalizedClientLink className="text-sm font-semibold leading-6" href="/sign-in">
                            Log In <span aria-hidden="true">&rarr;</span>
                        </LocalizedClientLink>
                    )}
                </NavbarItem>
                <NavbarMenuToggle className="sm:hidden" />
            </NavbarContent>
            <NavbarMenu>
                <div className="mx-4 mt-2 flex flex-col gap-2">
                    {siteConfig.navItems.map((item: any, index: number) => (
                        <NavbarItem key={`${item}-${index}`}>
                            <LocalizedClientLink href={item.href}>{item.label}</LocalizedClientLink>
                        </NavbarItem>
                    ))}
                </div>
            </NavbarMenu>
        </NavigationBar>
    );
};

export default AdminNavbar;
