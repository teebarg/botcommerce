import { toast } from "sonner";
import { useStopImpersonation } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import { useRouteContext, useRouter } from "@tanstack/react-router";
import { useCallback } from "react";

export default function ImpersonationBanner() {
    const { isImpersonating } = useRouteContext({ strict: false });
    const router = useRouter();
    const stopImpersonation = useStopImpersonation();

    const handleStopImpersonation = useCallback(async () => {
        try {
            await stopImpersonation.mutateAsync();
            toast.loading("Exiting Impersonation......");
            window.location.reload();
        } catch (err) {
            console.error("Impersonation failed", err);
        }
    }, [stopImpersonation.mutateAsync, router]);

    if (!isImpersonating) return null;

    return (
        <div className="fixed bottom-24 md:bottom-12 left-4 z-50 flex gap-2 items-center justify-between px-2.5 py-1.5 rounded-md bg-amber-100 text-amber-900 shadow-md">
            <span className="text-sm">Impersonation mode</span>
            <Button className="underline bg-transparent text-inherit" size="sm" variant="ghost" onClick={handleStopImpersonation}>
                Exit
            </Button>
        </div>
    );
}
