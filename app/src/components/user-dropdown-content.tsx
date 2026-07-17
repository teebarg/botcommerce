import { DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { User, LogOut, Gift, LayoutDashboard, Heart } from "lucide-react";
import { useNavigate, useRouteContext, useRouter } from "@tanstack/react-router";
import { tryCatch } from "@/utils/try-catch";
import { logoutFn } from "@/server/users.server";
import { Message } from "@/schemas";
import { useAuth } from "@clerk/tanstack-react-start";
import { api } from "@/utils/api";
import { useQueryClient } from "@tanstack/react-query";

interface UserDropdownContentProps {
  closeMenu?: () => void;
}

export default function UserDropdownContent({ closeMenu }: UserDropdownContentProps) {
  const { isImpersonating, isAdmin, user, userId } = useRouteContext({ strict: false });
  const queryClient = useQueryClient();
  const router = useRouter();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    const { error } = await tryCatch(api.post<Message>("/auth/logout"));
    if (error) {
      console.error("Logout failed:", error);
      return;
    }
    await signOut({ sessionId: userId?.toString() });
    await logoutFn();
    sessionStorage.clear();
    queryClient.setQueryData(["session"], null);
    queryClient.invalidateQueries({ queryKey: ["session"] });
    router.invalidate();
    navigate({ to: "/" });
  };

  return (
    <DropdownMenuContent className="w-56" align="end" forceMount>
      <DropdownMenuLabel className="font-normal">
        <div className="flex flex-col space-y-1">
          <p className="text-sm font-medium leading-none">{user?.firstName || "My Account"}</p>
          <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem className="cursor-pointer" onClick={() => navigate({ to: "/account" })}>
            <User className="mr-2 h-4 w-4" />
            <span>Account</span>
        </DropdownMenuItem>
      {isAdmin && (
        <DropdownMenuItem onClick={() => navigate({ to: "/admin" })}>
          <LayoutDashboard className="mr-2 h-4 w-4" />
          <span>Admin Dashboard</span>
        </DropdownMenuItem>
      )}
      <DropdownMenuItem onClick={() => navigate({ to: "/account" })}>
        <User className="mr-2 h-4 w-4" />
        <span>Account</span>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => navigate({ to: "/wishlist" })}>
        <Heart className="mr-2 h-4 w-4" />
        <span>My Favorites</span>
      </DropdownMenuItem>
      <DropdownMenuItem className="cursor-pointer" onClick={() => navigate({ to: "/account/referrals" })}>
        <Gift className="mr-2 h-4 w-4" />
        <span>Referrals</span>
    </DropdownMenuItem>
    {!isImpersonating && (
        <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log Out</span>
            </DropdownMenuItem>
        </>
    )}
    </DropdownMenuContent>
  );
}
