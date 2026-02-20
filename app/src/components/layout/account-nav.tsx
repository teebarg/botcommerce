import { Gift, MapPin, Package, User } from "lucide-react";
import LocalizedClientLink from "@/components/ui/link";
import { useInvalidateMe } from "@/hooks/useUser";

const AccountNav = () => {
    const invalidate = useInvalidateMe();

    const handleLogout = async () => {
        window.location.href = "/api/auth/signout";
        invalidate();
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
        {
            href: "/account/referrals",
            icon: <Gift className="h-6 w-6" />,
            label: "Referrals",
            dataTestid: "referrals-link",
        },
    ];

    return (
        <div>
            <div className="pb-4">
                <h3 className="text-base">Account</h3>
            </div>
            <div className="text-base">
                <ul className="flex mb-0 justify-start items-start flex-col gap-y-4">
                    {navLinks?.map((link, index: number) => (
                        <li key={`account-${index}`}>
                            <AccountNavLink data-testid={link.dataTestid} href={link.href}>
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
    );
};

type AccountNavLinkProps = {
    href: string;
    children: React.ReactNode;
    "data-testid"?: string;
};

const AccountNavLink = ({ href, children, "data-testid": dataTestId }: AccountNavLinkProps) => {
    return (
        <LocalizedClientLink active="text-primary font-semibold" className="text-muted-foreground" data-testid={dataTestId} href={href}>
            {children}
        </LocalizedClientLink>
    );
};

export default AccountNav;
