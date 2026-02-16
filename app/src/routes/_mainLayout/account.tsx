import AccountNav from "@/components/layout/account-nav";
import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Box, Gift, MapPin, Package, User } from "lucide-react";

export const Route = createFileRoute("/_mainLayout/account")({
    beforeLoad: ({ context, location }) => {
        if (!context.session) {
            throw redirect({ to: "/auth/signin", search: { callbackUrl: location.href } });
        }
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
    const { session } = Route.useRouteContext();
    return (
        <div className="flex-1">
            <div className="bg-blur md:hidden sticky top-16 z-20">
                <motion.ul initial={{ y: 100 }} animate={{ y: 0 }} className="grid grid-cols-5 px-2">
                    {navLinks.map((link, idx: number) => (
                        <li key={idx}>
                            <Link
                                activeProps={{ className: "bg-primary/20 text-primary" }}
                                activeOptions={{ exact: true }}
                                className="text-xs font-semibold"
                                data-testid={link.dataTestid}
                                to={link.href}
                            >
                                <div className="flex flex-col items-center p-4 gap-1">
                                    <div className="bg-secondary p-2 rounded-xl">{link.icon}</div>
                                    <span>{link.label}</span>
                                </div>
                            </Link>
                        </li>
                    ))}
                </motion.ul>
            </div>
            <div className="max-w-7xl mx-auto flex md:gap-4 pb-12 pt-8">
                <div className="md:w-60 hidden md:block">
                    <div className="md:sticky md:top-16">{session?.user && <AccountNav />}</div>
                </div>
                <AnimatePresence mode="wait" custom={0}>
                    <motion.div
                        custom={0}
                        variants={{
                            enter: { opacity: 0, x: -300 },
                            exit: { opacity: 0, x: 300 },
                            center: { opacity: 1, x: 0 },
                        }}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 },
                        }}
                        className="flex-1"
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
