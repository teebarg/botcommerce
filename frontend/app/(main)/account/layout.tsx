"use client";

import { Box, MapPin, Package, User } from "lucide-react";
import { useSession } from "next-auth/react";

import RecommendedProducts from "@/components/store/products/recommended";
import LocalizedClientLink from "@/components/ui/link";
import { Separator } from "@/components/ui/separator";
import AccountNav from "@/components/layout/account-nav";

const navLinks = [
    {
        href: "/account",
        icon: <Box className="h-8 w-8" />,
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

export default function AccountPageLayout({ dashboard }: { dashboard?: React.ReactNode }) {
    const { data: session } = useSession();

    return (
        <div className="flex-1 sm:py-4 px-2 md:px-0" data-testid="account-page">
            <div className="bg-card text-secondary-foreground p-6 md:hidden">
                <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                        <User className="h-10 w-10" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">
                            {session?.user?.first_name} {session?.user?.last_name}
                        </h1>
                        <p>{session?.user?.email}</p>
                    </div>
                </div>
            </div>
            <div className="bg-card md:hidden" data-testid="mobile-account-nav">
                <ul className="grid grid-cols-4 gap-4 px-6">
                    {navLinks.map((link, idx: number) => (
                        <li key={idx}>
                            <LocalizedClientLink
                                active="text-contrast"
                                className="text-xs font-semibold"
                                data-testid={link.dataTestid}
                                href={link.href}
                            >
                                <div className="flex flex-col items-center p-4">
                                    {link.icon}
                                    <span>{link.label}</span>
                                </div>
                            </LocalizedClientLink>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="flex-1 h-full max-w-7xl mx-auto flex flex-col rounded-md md:px-8">
                <div className="md:flex md:gap-4 py-4 md:py-12">
                    <div className="md:min-w-60">{session?.user && <AccountNav />}</div>
                    <div className="md:flex-1">{dashboard}</div>
                </div>
                <Separator className="my-4" />
                <div className="flex flex-col sm:flex-row items-end justify-between py-4 px-2 md:px-0 gap-8">
                    <div>
                        <h3 className="text-lg font-medium">Got questions?</h3>
                        <span className="text-sm">You can find frequently asked questions and answers on our customer service page.</span>
                    </div>
                    <div>
                        <LocalizedClientLink className="text-primary/50" href="/customer-service">
                            Customer Service
                        </LocalizedClientLink>
                    </div>
                </div>
                <div className="mt-8 px-2 md:px-0">
                    <p className="text:sm md:text-lg font-semibold">More to love</p>
                    <Separator className="my-2" />
                    <RecommendedProducts />
                </div>
            </div>
        </div>
    );
}
