import { Navbar as NextUINavbar, NavbarContent, NavbarMenu, NavbarMenuToggle, NavbarBrand, NavbarItem, NavbarMenuItem } from "@nextui-org/navbar";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { getCustomer } from "@lib/data";
import UserDropDown from "@modules/account/components/user-menu";
import { ThemeSwitch } from "@modules/common/components/theme-switch";
import { siteConfig } from "@lib/config";

const AdminNavbar = async () => {
    const customer = await getCustomer().catch(() => null);

    return (
        <NextUINavbar maxWidth="xl" position="sticky">
            <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
                <NavbarBrand as="li" className="gap-3 max-w-fit">
                    <LocalizedClientLink className="flex justify-start items-center gap-1" href="/admin">
                        <p className="font-bold text-inherit">TBO</p>
                    </LocalizedClientLink>
                </NavbarBrand>
            </NavbarContent>

            <NavbarContent className="flex basis-1/5 sm:basis-full" justify="end">
                <NavbarItem className="flex">
                    <LocalizedClientLink className="text-sm font-semibold leading-6" href="/">
                        Store
                    </LocalizedClientLink>
                </NavbarItem>
                <NavbarItem className="flex gap-2 items-baseline justify-center">
                    {/* <Notification /> */}
                    <ThemeSwitch />
                </NavbarItem>
                <NavbarItem className="flex">
                    {customer ? (
                        <UserDropDown customer={customer} />
                    ) : (
                        <LocalizedClientLink className="text-sm font-semibold leading-6" href="/admin">
                            Log In <span aria-hidden="true">&rarr;</span>
                        </LocalizedClientLink>
                    )}
                </NavbarItem>
                <NavbarMenuToggle className="sm:hidden" />
            </NavbarContent>
            <NavbarMenu>
                <div className="mx-4 mt-2 flex flex-col gap-2">
                    {siteConfig.navItems.map((item: any, index: number) => (
                        <NavbarMenuItem key={`${item}-${index}`}>
                            <LocalizedClientLink href={item.href}>{item.label}</LocalizedClientLink>
                        </NavbarMenuItem>
                    ))}
                </div>
            </NavbarMenu>
        </NextUINavbar>
    );
};

export default AdminNavbar;
