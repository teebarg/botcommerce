import AccountNav from "@/components/layout/account-nav";
import { SignInRedirect } from "@/utils/reuseable";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { Box, Gift, MapPin, Package, User } from "lucide-react";

export const Route = createFileRoute("/_mainLayout/account")({
    beforeLoad: ({ context }) => {
        if (!context.isAuthenticated) {
            throw new Error("Not authenticated");
        }
    },
    errorComponent: ({ error }) => {
        if (error.message === "Not authenticated") {
            return <SignInRedirect />;
        }

        throw error;
    },
    component: RouteComponent,
});

const navLinks = [
    {
        href: "/account",
        icon: <Box className="h-6 w-6" />,
        label: "Overview",
        dataTestid: "overview-link",
    },
    {
        href: "/account/profile",
        icon: <User className="h-6 w-6" />,
        label: "Profile",
        dataTestid: "addresses-link",
    },
    {
        href: "/account/addresses",
        icon: <MapPin className="h-6 w-6" />,
        label: "Addresses",
        dataTestid: "addresses-link",
    },
    {
        href: "/account/orders",
        icon: <Package className="h-6 w-6" />,
        label: "Orders",
        dataTestid: "orders-link",
    },
    {
        href: "/account/referrals",
        icon: <Gift className="h-6 w-6" />,
        label: "Referrals",
        dataTestid: "referrals-link",
    },
];

function RouteComponent() {
    const { isAuthenticated } = Route.useRouteContext();
    return (
        <div className="flex-1">
            <div className="bg-background/60 backdrop-blur-md md:hidden sticky z-20 top-[calc(var(--sat)+64px)]">
                <ul className="grid grid-cols-5 px-2">
                    {navLinks.map((link, idx: number) => (
                        <li key={idx}>
                            <Link
                                activeProps={{ className: "text-accent" }}
                                activeOptions={{ exact: true }}
                                className="text-xs font-semibold"
                                data-testid={link.dataTestid}
                                to={link.href}
                            >
                                <div className="flex flex-col items-center py-2 gap-1">
                                    <div className="bg-secondary p-2 rounded-xl">{link.icon}</div>
                                    <span>{link.label}</span>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="max-w-7xl mx-auto flex md:gap-4 pb-4 md:pt-6">
                <div className="md:w-60 hidden md:block">
                    <div className="md:sticky md:top-16">{isAuthenticated && <AccountNav />}</div>
                </div>
                <div className="flex-1">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
