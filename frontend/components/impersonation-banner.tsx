"use client";

import { X } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

export default function ImpersonationBanner() {
    const { data: session, update } = useSession();

    const stopImpersonation = async () => {
        await update({ email: session?.impersonatedBy!, impersonated: false, impersonatedBy: null, mode: "impersonate" });
        toast.success("Exited impersonation");
        window.location.reload();
    };

    if (!session?.impersonated) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 px-3 py-2 rounded-md bg-amber-100 text-amber-900 shadow-md border border-amber-300">
            <span className="text-sm">Impersonation mode</span>
            <button onClick={stopImpersonation} className="text-xs font-semibold underline">
                Exit
            </button>
            <button aria-label="dismiss" onClick={stopImpersonation} className="ml-1">
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}
