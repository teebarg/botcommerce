import { X } from "lucide-react";
import { toast } from "sonner";
import { useInvalidateMe } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import { useRouteContext, useRouter } from "@tanstack/react-router";
import { stopImpersonationFn } from "@/server/users.server";

export default function ImpersonationBanner() {
    const { isImpersonating } = useRouteContext({ strict: false });
    const invalidateMe = useInvalidateMe();
    const router = useRouter();

    const stopImpersonation = async () => {
        try {
            await stopImpersonationFn()
            invalidateMe();

            toast.success("Exited impersonation");
            await router.invalidate();
            await router.navigate({ to: "/" });
        } catch (err) {
            console.error("Impersonation failed", err);
        }
    };

    if (!isImpersonating) return null;

    return (
        <div className="fixed bottom-24 md:bottom-12 left-4 z-50 flex items-center px-3 py-2 gap-1 rounded-md bg-amber-100 text-amber-900 shadow-md border border-amber-300">
            <span className="text-sm mr-3">Impersonation mode</span>
            <Button className="underline" size="sm" variant="ghost" onClick={stopImpersonation}>
                Exit
            </Button>
            <Button aria-label="dismiss" size="icon" variant="ghost" onClick={stopImpersonation}>
                <X className="h-4 w-4" />
            </Button>
        </div>
    );
}
