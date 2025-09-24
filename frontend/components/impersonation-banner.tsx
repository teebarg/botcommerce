"use client";

import { X } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function ImpersonationBanner() {
    const { data: session, update } = useSession();

    const stopImpersonation = async () => {
        await update({ email: session?.impersonatedBy!, impersonated: false, impersonatedBy: null, mode: "impersonate" });
        toast.success("Exited impersonation");
        window.location.reload();
    };

    if (!session?.impersonated) return null;

    return (
        <div className="fixed bottom-24 md:bottom-12 left-4 z-50 flex items-center px-3 py-2 gap-1 rounded-md bg-amber-100 text-amber-900 shadow-md border border-amber-300">
            <span className="text-sm mr-3">Impersonation mode</span>
            <Button className="underline" size="sm" variant="ghost" onClick={stopImpersonation}>
                Exit
            </Button>
            <Button aria-label="dismiss" size="iconOnly" onClick={stopImpersonation}>
                <X className="h-4 w-4" />
            </Button>
        </div>
    );
}
