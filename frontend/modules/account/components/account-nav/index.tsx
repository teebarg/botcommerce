"use client";

import { ChevronDown, User } from "nui-react-icons";
import { usePathname } from "next/navigation";
import { signOut } from "@modules/account/actions";
import MapPin from "@modules/common/icons/map-pin";
import Package from "@modules/common/icons/package";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { Customer } from "types/global";
import { cn } from "@lib/util/cn";

const AccountNav = ({ customer }: { customer: Omit<Customer, "password_hash"> | null }) => {
    const route = usePathname();

    const handleLogout = async () => {
        await signOut();
    };

    const navLinks = [
        {
            href: "/account",
            icon: <User className="h-8 w-8" viewBox="0 0 20 20" />,
            label: "Overview",
            dataTestid: "addresses-link",
        },
        {
            href: "/account/profile",
            icon: <User className="h-8 w-8" viewBox="0 0 20 20" />,
            label: "Profile",
            dataTestid: "addresses-link",
        },
        {
            href: "/account/addresses",
            icon: <MapPin className="h-8 w-8" />,
            label: "Addresses",
            dataTestid: "addresses-link",
        },
        {
            href: "/account/orders",
            icon: <Package className="h-8 w-8" />,
            label: "Orders",
            dataTestid: "orders-link",
        },
    ];

    return (
        <div>
            <div className="sm:hidden" data-testid="mobile-account-nav">
                {route !== `/account` ? (
                    <LocalizedClientLink className="flex items-center gap-x-2 text-sm py-2" data-testid="account-main-link" href="/account">
                        <>
                            <ChevronDown className="transform rotate-90" />
                            <span>Account</span>
                        </>
                    </LocalizedClientLink>
                ) : (
                    <>
                        <div className="text-xl mb-4 px-8">Hello {customer?.firstname}</div>
                        <div className="text-base">
                            <ul className="flex justify-between px-2">
                                {navLinks.map((link, index: number) => (
                                    <li key={index}>
                                        <LocalizedClientLink
                                            className="py-4 px-8 text-xs font-semibold"
                                            data-testid={link.dataTestid}
                                            href={link.href}
                                        >
                                            <>
                                                <div className="flex flex-col items-center">
                                                    {link.icon}
                                                    <span>{link.label}</span>
                                                </div>
                                            </>
                                        </LocalizedClientLink>
                                    </li>
                                ))}
                                {/* <li>
                                    <button className="py-4 px-8" data-testid="logout-button" type="button" onClick={handleLogout}>
                                        <div className="flex flex-col items-center">
                                            <ArrowRightOnRectangle />
                                            <span>Log out</span>
                                        </div>
                                    </button>
                                </li> */}
                            </ul>
                        </div>
                    </>
                )}
            </div>
            <div className="hidden sm:block" data-testid="account-nav">
                <div>
                    <div className="pb-4">
                        <h3 className="text-base">Account</h3>
                    </div>
                    <div className="text-base">
                        <ul className="flex mb-0 justify-start items-start flex-col gap-y-4">
                            <li>
                                <AccountNavLink data-testid="overview-link" href="/account" route={route!}>
                                    Overview
                                </AccountNavLink>
                            </li>
                            <li>
                                <AccountNavLink data-testid="profile-link" href="/account/profile" route={route!}>
                                    Profile
                                </AccountNavLink>
                            </li>
                            <li>
                                <AccountNavLink data-testid="addresses-link" href="/account/addresses" route={route!}>
                                    Addresses
                                </AccountNavLink>
                            </li>
                            <li>
                                <AccountNavLink data-testid="orders-link" href="/account/orders" route={route!}>
                                    Orders
                                </AccountNavLink>
                            </li>
                            <li className="text-grey-700">
                                <button data-testid="logout-button" type="button" onClick={handleLogout}>
                                    Log out
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

type AccountNavLinkProps = {
    href: string;
    route: string;
    children: React.ReactNode;
    "data-testid"?: string;
};

const AccountNavLink = ({ href, route, children, "data-testid": dataTestId }: AccountNavLinkProps) => {
    const active = route === href;

    return (
        <LocalizedClientLink
            className={cn("text-default-500 hover:text-default-900", {
                "text-default-900 font-semibold": active,
            })}
            data-testid={dataTestId}
            href={href}
        >
            {children}
        </LocalizedClientLink>
    );
};

export default AccountNav;
