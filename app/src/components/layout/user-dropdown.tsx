import LocalizedClientLink from "@/components/ui/link";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useInvalidateMe } from "@/hooks/useUser";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { deleteCookie } from "@/lib/util/cookie";
import { useInvalidateCart } from "@/hooks/useCart";
import { UserSession } from "@/schemas";

export default function UserDropDown({ user }: { user: UserSession }) {
    const invalidate = useInvalidateMe();
    const invalidateCart = useInvalidateCart();
    const handleLogout = () => {
        deleteCookie("_cart_id");
        // authApi.logOut().catch(() => {});

        invalidate();
        invalidateCart();

        // must come last
        window.location.href = "/api/auth/signout";
    };

    const links = [
        {
            dataKey: "profile",
            child: (
                <span className="flex-1 text-sm font-normal truncate">
                    <LocalizedClientLink href="/account/profile">Profile</LocalizedClientLink>
                </span>
            ),
        },
        {
            dataKey: "account",
            child: (
                <span className="flex-1 text-sm font-normal truncate">
                    <LocalizedClientLink href="/account">Dashboard</LocalizedClientLink>
                </span>
            ),
        },
        {
            dataKey: "account",
            child: (
                <button aria-label="log out" className="text-red-500 cursor-pointer" data-testid="logout-button" type="button" onClick={handleLogout}>
                    Log out
                </button>
            ),
        },
    ];

    const getInitials = () => {
        return user?.first_name ? user?.first_name?.[0] : "G";
    };

    if (user.role === "ADMIN") {
        links.unshift({
            dataKey: "admin",
            child: (
                <span className="flex-1 text-sm font-normal truncate">
                    <LocalizedClientLink href="/admin">Admin</LocalizedClientLink>
                </span>
            ),
        });
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <Avatar>
                    <AvatarImage alt="@user" src={user.image ?? undefined} />
                    <AvatarFallback>{getInitials()}</AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                    <div key="user" className="flex gap-2">
                        <p className="font-semibold">Signed in as</p>
                        <p className="font-semibold">@{user?.first_name}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {links.map((item, index: number) => (
                    <DropdownMenuItem key={index} className="px-2 py-1.5 cursor-pointer" data-key={item.dataKey}>
                        {item.child}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
