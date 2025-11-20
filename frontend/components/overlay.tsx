import { useEffect, useState } from "react";

import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface OverlayProps {
    trigger: React.ReactNode;
    children: React.ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    sheetClassName?: string;
    showHeader?: boolean;
}

const Overlay: React.FC<OverlayProps> = ({
    trigger,
    children,
    open,
    onOpenChange,
    title = "Content",
    sheetClassName = "min-w-[400px]",
    showHeader = false,
}) => {
    const [isIOS, setIsIOS] = useState(false);
    const { isDesktop } = useMediaQuery();

    useEffect(() => {
        // Detect iOS to enable safe-area patches
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));
    }, []);

    if (isDesktop) {
        return (
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetTrigger asChild>{trigger}</SheetTrigger>
                <SheetContent aria-describedby={undefined} className={sheetClassName}>
                    <SheetHeader className={showHeader ? "" : "sr-only"}>
                        <SheetTitle>{title}</SheetTitle>
                    </SheetHeader>
                    {children}
                </SheetContent>
            </Sheet>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className={cn(isIOS && "pb-[env(safe-area-inset-bottom)]")} size="full">
                <div className="overflow-y-auto">{children}</div>
            </DialogContent>
        </Dialog>
    );
};

export default Overlay;
