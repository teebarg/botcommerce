"use client";

import { User as UserIcon } from "nui-react-icons";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@lib/util/cn";
import { MapPin, Package } from "lucide-react";

import LocalizedClientLink from "@/components/ui/link";
import { api } from "@/apis";

const AccountNav = () => {
    const route = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        await api.auth.logOut();
        router.push("/");
    };

    const navLinks = [
        {
            href: "/account",
            icon: <UserIcon className="h-8 w-8" viewBox="0 0 20 20" />,
            label: "Overview",
            dataTestid: "overview-link",
        },
        {
            href: "/account/profile",
            icon: <UserIcon className="h-8 w-8" viewBox="0 0 20 20" />,
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
