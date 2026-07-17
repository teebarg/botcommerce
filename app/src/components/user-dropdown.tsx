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
      <Button onClick={() => navigate({ to: "/sign-in", search: { redirect: location.pathname } })} size="xxs">
        Sign In
      </Button>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button size="iconOnly">
          <UserAvatar className="h-8 w-8" />
        </Button>
      </DropdownMenuTrigger>

      {isOpen && (
        <Suspense fallback={null}>
          <UserDropdownContent closeMenu={() => setIsOpen(false)} />
        </Suspense>
      )}
    </DropdownMenu>
  );
}
