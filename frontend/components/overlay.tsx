import { useEffect, useState } from "react";

import { BottomSheet } from "./bottom-sheet";

import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { Dialog, DialogPortal, DialogOverlay, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface OverlayProps {
    trigger: React.ReactNode;
    children: React.ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    sheetClassName?: string;
    showHeader?: boolean;
    showCloseButton?: boolean;
}

const Overlay: React.FC<OverlayProps> = ({
    trigger,
    children,
    open,
    onOpenChange,
    title = "Content",
    sheetClassName = "min-w-[400px]",
    showHeader = false,
    showCloseButton = true,
}) => {
    const [isIOS, setIsIOS] = useState(false);
    const { isDesktop } = useMediaQuery();

    useEffect(() => {
        // Detect iOS to enable safe-area patches
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));
    }, []);

    // if (isDesktop) {
    //     return (
    //         <Sheet open={open} onOpenChange={onOpenChange}>
    //             <SheetTrigger asChild>{trigger}</SheetTrigger>
    //             <SheetContent aria-describedby={undefined} className={sheetClassName}>
    //                 <SheetHeader className={showHeader ? "" : "sr-only"}>
    //                     <SheetTitle>{title}</SheetTitle>
    //                 </SheetHeader>
    //                 {children}
    //             </SheetContent>
    //         </Sheet>
    //     );
    // }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent size="full">
                <div className="overflow-y-auto pt-8 h-dvh">{children}</div>
            </DialogContent>
        </Dialog>
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogPortal>
                <DialogTrigger asChild>{trigger}</DialogTrigger>
                <DialogOverlay className="fixed inset-0 bg-black/40 backdrop-blur-sm" />

                <DialogContent
                    className={cn(
                        `fixed bottom-0 left-0 right-0 bg-background rounded-t-2xl shadow-2xl border-t animate-in slide-in-from-bottom overflow-y-auto max-h-dvh h-auto`,
                        isIOS && "pb-[env(safe-area-inset-bottom)]"
                    )}
                >
                    {/* Drag Handle Bar */}
                    <div className="w-12 h-1.5 rounded-full bg-muted mx-auto mb-4" />

                    {children}
                </DialogContent>
            </DialogPortal>
        </Dialog>
    );

    return (
        <BottomSheet open={open} onOpenChange={onOpenChange}>
            <form className="space-y-4 px-4 pb-10">
                <input className="w-full border rounded p-3 text-base" placeholder="Name" type="text" />

                <input className="w-full border rounded p-3 text-base" placeholder="Email" type="email" />

                <button className="w-full bg-primary text-white rounded p-3">Submit</button>
            </form>
        </BottomSheet>
    );

    // return (
    //     <Drawer open={open} onOpenChange={onOpenChange}>
    //         <DrawerTrigger asChild>{trigger}</DrawerTrigger>
    //         <DrawerContent aria-describedby={undefined} className="h-dvh max-h-dvh touch-manipulation">
    //             <DrawerHeader className={showHeader ? "" : "sr-only"}>
    //                 <DrawerTitle>{title}</DrawerTitle>
    //             </DrawerHeader>
    //             {showCloseButton && (
    //                 <DrawerClose className="absolute top-4 right-4 z-70 p-2">
    //                     <X className="h-5 w-5" />
    //                 </DrawerClose>
    //             )}
    //             {children}
    //         </DrawerContent>
    //     </Drawer>
    // );
};

export default Overlay;
