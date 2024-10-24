"use client";

import { ArrowRightOnRectangle, ChevronDown, User } from "nui-react-icons";
import { usePathname } from "next/navigation";
import { signOut } from "@modules/account/actions";
import MapPin from "@modules/common/icons/map-pin";
import Package from "@modules/common/icons/package";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import clsx from "clsx";
import { Customer } from "types/global";

const AccountNav = ({ customer }: { customer: Omit<Customer, "password_hash"> | null }) => {
    const route = usePathname();

    const handleLogout = async () => {
        await signOut();
    };

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
                            <ul>
                                <li>
                                    <LocalizedClientLink
                                        className="flex items-center justify-between py-4 border-b border-gray-200 px-8"
                                        data-testid="overview-link"
                                        href="/account"
                                    >
                                        <>
                                            <div className="flex items-center gap-x-2">
                                                <User size={20} />
                                                <span>Overview</span>
                                            </div>
                                            <ChevronDown className="transform -rotate-90" />
                                        </>
                                    </LocalizedClientLink>
                                </li>
                                <li>
                                    <LocalizedClientLink
                                        className="flex items-center justify-between py-4 border-b border-gray-200 px-8"
                                        data-testid="profile-link"
                                        href="/account/profile"
                                    >
                                        <>
                                            <div className="flex items-center gap-x-2">
                                                <User size={20} />
                                                <span>Profile</span>
                                            </div>
                                            <ChevronDown className="transform -rotate-90" />
                                        </>
                                    </LocalizedClientLink>
                                </li>
                                <li>
                                    <LocalizedClientLink
                                        className="flex items-center justify-between py-4 border-b border-gray-200 px-8"
                                        data-testid="addresses-link"
                                        href="/account/addresses"
                                    >
                                        <>
                                            <div className="flex items-center gap-x-2">
                                                <MapPin size={20} />
                                                <span>Addresses</span>
                                            </div>
                                            <ChevronDown className="transform -rotate-90" />
                                        </>
                                    </LocalizedClientLink>
                                </li>
                                <li>
                                    <LocalizedClientLink
                                        className="flex items-center justify-between py-4 border-b border-gray-200 px-8"
                                        data-testid="orders-link"
                                        href="/account/orders"
                                    >
                                        <div className="flex items-center gap-x-2">
                                            <Package size={20} />
                                            <span>Orders</span>
                                        </div>
                                        <ChevronDown className="transform -rotate-90" />
                                    </LocalizedClientLink>
                                </li>
                                <li>
                                    <button
                                        className="flex items-center justify-between py-4 border-b border-gray-200 px-8 w-full"
                                        data-testid="logout-button"
                                        type="button"
                                        onClick={handleLogout}
                                    >
                                        <div className="flex items-center gap-x-2">
                                            <ArrowRightOnRectangle />
                                            <span>Log out</span>
                                        </div>
                                        <ChevronDown className="transform -rotate-90" />
                                    </button>
                                </li>
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
            className={clsx("text-default-500 hover:text-default-800", {
                "text-default-800 font-semibold": active,
            })}
            data-testid={dataTestId}
            href={href}
        >
            {children}
        </LocalizedClientLink>
    );
};

export default AccountNav;
