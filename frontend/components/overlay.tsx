import { X } from "lucide-react";

import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useMediaQuery } from "@/lib/hooks/use-media-query";

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
    const { isDesktop } = useMediaQuery();

    if (isDesktop) {
        return (
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetTrigger asChild>{trigger}</SheetTrigger>
                <SheetContent className={sheetClassName} aria-describedby={undefined}>
                    <SheetHeader className={showHeader ? "" : "sr-only"}>
                        <SheetTitle>{title}</SheetTitle>
                    </SheetHeader>
                    {children}
                </SheetContent>
            </Sheet>
        );
    }

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerTrigger asChild>{trigger}</DrawerTrigger>
            <DrawerContent aria-describedby={undefined}>
                <DrawerHeader className={showHeader ? "" : "sr-only"}>
                    <DrawerTitle>{title}</DrawerTitle>
                </DrawerHeader>
                {showCloseButton && (
                    <DrawerClose className="absolute top-4 right-4 z-70">
                        <X className="h-5 w-5" />
                    </DrawerClose>
                )}
                {children}
            </DrawerContent>
        </Drawer>
    );
};

export default Overlay;
