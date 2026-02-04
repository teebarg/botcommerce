import { cn } from "@/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";

interface OverlayProps {
    trigger: React.ReactNode;
    children: React.ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string | React.ReactNode;
    sheetClassName?: string;
    showHeader?: boolean;
    side?: "top" | "right" | "bottom" | "left";
}

const SheetDrawer: React.FC<OverlayProps> = ({
    trigger,
    children,
    open,
    onOpenChange,
    title = "Header Content",
    sheetClassName = "",
    showHeader = true,
    side = "right",
}) => {
    const isMobile = useIsMobile();
    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={onOpenChange}>
                <DrawerTrigger asChild>{trigger}</DrawerTrigger>
                <DrawerContent className="data-[vaul-drawer-direction=bottom]:max-h-[85vh]">
                    <DrawerHeader>
                        <DrawerTitle>{title}</DrawerTitle>
                    </DrawerHeader>
                    <AnimatePresence mode="wait">{children}</AnimatePresence>
                </DrawerContent>
            </Drawer>
        );
    }
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetTrigger asChild>{trigger}</SheetTrigger>
            <SheetContent side={side} className={cn("w-full sm:max-w-lg px-0 py-2 flex flex-col bg-card border-border", sheetClassName)}>
                <SheetHeader className={showHeader ? "px-4 mt-1" : "sr-only"}>
                    <SheetTitle className="flex items-center gap-3 text-xl">{title}</SheetTitle>
                </SheetHeader>
                <AnimatePresence mode="wait">{children}</AnimatePresence>
            </SheetContent>
        </Sheet>
    );
};

export default SheetDrawer;
