"use client";

import { usePathname } from "next/navigation";
import { MapPin, Package, User } from "lucide-react";

import { cn } from "@/lib/utils";
import LocalizedClientLink from "@/components/ui/link";
import { authApi } from "@/apis/auth";
import { useInvalidateMe } from "@/lib/hooks/useUser";
import { signOut } from "next-auth/react";

const AccountNav = () => {
    const route = usePathname();
    const invalidate = useInvalidateMe();

    const handleLogout = async () => {
        await authApi.logOut();
        await signOut();
        invalidate();
        window.location.href = "/";
    };

    const navLinks = [
        {
            href: "/account",
            icon: <User className="h-8 w-8" />,
            label: "Overview",
            dataTestid: "overview-link",
        },
        {
            href: "/account/profile",
            icon: <User className="h-8 w-8" />,
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
            <div className="hidden sm:block" data-testid="account-nav">
                <div>
                    <div className="pb-4">
                        <h3 className="text-base">Account</h3>
                    </div>
                    <div className="text-base">
                        <ul className="flex mb-0 justify-start items-start flex-col gap-y-4">
                            {navLinks.map((link, index: number) => (
                                <li key={`account-${index}`}>
                                    <AccountNavLink data-testid={link.dataTestid} href={link.href} route={route!}>
                                        {link.label}
                                    </AccountNavLink>
                                </li>
                            ))}
                            <li className="text-grey-700">
                                <button aria-label="log out" data-testid="logout-button" type="button" onClick={handleLogout}>
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
