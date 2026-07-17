import { useState, lazy, Suspense } from "react";
import { useRouteContext, useNavigate } from "@tanstack/react-router";
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "./generic/user-avatar";

const UserDropdownContent = lazy(() => import("./user-dropdown-content"));

export function UserDropdown() {
  const { isAuthenticated } = useRouteContext({ strict: false });
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

    if (!isAuthenticated) {
        return (
            <Button className="min-w-0 px-2" onClick={() => navigate({ to: "/sign-in", search: { redirect: location.pathname } })} size="xxs">
                Sign In
            </Button>
        );
    }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
          <UserAvatar className="h-10 w-10" />
        </Button>
      </DropdownMenuTrigger>

      {/* Load chunk files on-demand strictly when opened */}
      {isOpen && (
        <Suspense fallback={null}>
          <UserDropdownContent closeMenu={() => setIsOpen(false)} />
        </Suspense>
      )}
    </DropdownMenu>
  );
}
