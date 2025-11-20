"use client";

import { useEffect, useState } from "react";

import { Dialog, DialogPortal, DialogOverlay, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function BottomSheet({
    open,
    onOpenChange,
    children,
    className,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
    className?: string;
}) {
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Detect iOS to enable safe-area patches
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));
    }, []);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogPortal>
                <DialogOverlay className="fixed inset-0 bg-black/40 backdrop-blur-sm" />

                <DialogContent
                    className={cn(
                        `fixed bottom-0 left-0 right-0 bg-background rounded-t-2xl shadow-2xl border-t animate-in slide-in-from-bottom overflow-y-auto max-h-dvh h-auto`,
                        isIOS && "pb-[env(safe-area-inset-bottom)]",
                        className
                    )}
                >
                    {/* Drag Handle Bar */}
                    <div className="w-12 h-1.5 rounded-full bg-muted mx-auto mb-4" />

                    {children}
                </DialogContent>
            </DialogPortal>
        </Dialog>
    );
}
