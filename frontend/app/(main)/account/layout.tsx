import { Package, User } from "nui-react-icons";
import { MapPin } from "lucide-react";

import RecommendedProducts from "@/components/store/products/recommended";
import AccountNav from "@/modules/account/components/account-nav";
import LocalizedClientLink from "@/components/ui/link";
import { auth } from "@/actions/auth";

const navLinks = [
    {
        href: "/account",
        icon: <User className="h-8 w-8" viewBox="0 0 20 20" />,
        label: "Overview",
        dataTestid: "overview-link",
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

export default async function AccountPageLayout({ dashboard }: { dashboard?: React.ReactNode }) {
    const user = await auth();

    return (
        <div className="flex-1 sm:py-4 px-2 md:px-0" data-testid="account-page">
            <div className="bg-blue-600 text-white p-6 md:hidden">
                <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                        <User className="h-10 w-10" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">
                            {user?.first_name} {user?.last_name}
                        </h1>
                        <p className="text-blue-100">{user?.email}</p>
                    </div>
                </div>
            </div>
            <div className="bg-content2 md:hidden" data-testid="mobile-account-nav">
                <div className="text-base">
                    <ul className="flex justify-between px-6">
                        {navLinks.map((link, index: number) => (
                            <li key={index}>
                                <LocalizedClientLink
                                    active="text-rose-500"
                                    className="px-8 text-xs font-semibold"
                                    data-testid={link.dataTestid}
                                    href={link.href}
                                >
                                    <div className="flex flex-col items-center">
                                        {link.icon}
                                        <span>{link.label}</span>
                                    </div>
                                </LocalizedClientLink>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <div className="flex-1 h-full max-w-7xl mx-auto bg-content1 flex flex-col rounded-md md:px-8">
                <div className="md:flex md:gap-4 py-4 md:py-12">
                    <div className="md:min-w-[15rem]">{user && <AccountNav />}</div>
                    <div className="md:flex-1">{dashboard}</div>
                </div>
                <div className="flex flex-col sm:flex-row items-end justify-between sm:border-t border-gray-300 dark:border-gray-500 py-4 md:py-12 gap-8">
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Got questions?</h3>
                        <span className="font-medium">You can find frequently asked questions and answers on our customer service page.</span>
                    </div>
                    <div>
                        <LocalizedClientLink href="/customer-service">Customer Service</LocalizedClientLink>
                    </div>
                </div>
                <div className="mt-4">
                    <p className="text:sm md:text-lg font-semibold">More to love</p>
                    <RecommendedProducts />
                </div>
            </div>
        </div>
    );
}
