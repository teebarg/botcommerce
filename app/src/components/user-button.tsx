import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Gift, LayoutDashboard, Heart } from "lucide-react";
import { useNavigate, useRouteContext } from "@tanstack/react-router";
import { tryCatch } from "@/utils/try-catch";
import { clientApi } from "@/utils/api.client";
import { logoutFn } from "@/server/users.server";
import { Message } from "@/schemas";
import { useAuth } from "@clerk/tanstack-react-start";
import { UserAvatar } from "./generic/user-avatar";
import { useLocation } from "@tanstack/react-router";

export function UserDropdown() {
    const { isAuthenticated, session } = useRouteContext({ strict: false });
    const location = useLocation();
    const navigate = useNavigate();
    const { signOut } = useAuth();

    const handleSignOut = async () => {
        const { error } = await tryCatch(clientApi.post<Message>("/auth/logout"));
        if (error) {
            console.error("Logout failed:", error);
            return;
        }
        await signOut({ sessionId: session?.id });
        await logoutFn();
        sessionStorage.clear();
        navigate({ to: "/" });
    };

    if (!isAuthenticated) {
        return (
            <Button onClick={() => navigate({ to: "/sign-in", search: { redirect: location.pathname } })} size="xs">
                Sign In
            </Button>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full ring-offset-background transition-all hover:ring-2 hover:ring-ring hover:ring-offset-2"
                    size="icon"
                >
                    <UserAvatar />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{session?.user?.firstName || "User"}</p>
                        <p className="text-xs leading-none text-muted-foreground">{session?.user?.email}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={() => navigate({ to: "/account" })}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Account</span>
                </DropdownMenuItem>
                {session?.user?.isAdmin && (
                    <DropdownMenuItem className="cursor-pointer" onClick={() => navigate({ to: "/admin" })}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Admin Panel</span>
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem className="cursor-pointer" onClick={() => navigate({ to: "/account/referrals" })}>
                    <Gift className="mr-2 h-4 w-4" />
                    <span>Referrals</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => navigate({ to: "/wishlist" })}>
                    <Heart className="mr-2 h-4 w-4" />
                    <span>Favorites</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
