import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, LogOut, Settings, Gift, CreditCard, CircleHelp as HelpCircle } from "lucide-react";
import { useNavigate, useRouteContext, useRouter } from "@tanstack/react-router";
import { tryCatch } from "@/utils/try-catch";
import { clientApi } from "@/utils/api.client";
import { logoutFn } from "@/server/users.server";
import { Message } from "@/schemas";
import { useAuth } from "@clerk/tanstack-react-start";
import { getInitials } from "@/utils";

export function UserDropdown() {
    const router = useRouter();
    const { isAuthenticated, session } = useRouteContext({ strict: false });
    console.log("🚀 ~ UserDropdown ~ isAuthenticated:", isAuthenticated);
    console.log("🚀 ~ UserDropdown ~ session:", session);
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
        // await router.invalidate();
        navigate({ to: "/" });
    };

    if (!isAuthenticated) {
        return (
            <Button onClick={() => navigate({ to: "/sign-in", search: { redirect: location.pathname } })} size="sm">
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
                >
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={session?.user?.image} alt={session?.user?.email || "User"} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                            {getInitials(session?.user?.firstName || "")}
                        </AvatarFallback>
                    </Avatar>
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
                <DropdownMenuItem className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Account</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>Billing</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                    <Gift className="mr-2 h-4 w-4" />
                    <span>Referrals</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>Support</span>
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
