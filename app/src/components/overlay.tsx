import { cn } from "@/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AnimatePresence } from "framer-motion";

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

const Overlay: React.FC<OverlayProps> = ({
    trigger,
    children,
    open,
    onOpenChange,
    title = "Header Content",
    sheetClassName = "",
    showHeader = true,
    side = "right",
}) => {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetTrigger asChild>{trigger}</SheetTrigger>
            <SheetContent side={side} className={cn("w-full sm:max-w-lg px-0 py-2 flex flex-col bg-card border-border", sheetClassName)}>
                {showHeader && (
                    <SheetHeader className="px-4 mt-1">
                        <SheetTitle className="flex items-center gap-3 text-xl">{title}</SheetTitle>
                    </SheetHeader>
                )}
                <AnimatePresence mode="wait">{children}</AnimatePresence>
            </SheetContent>
        </Sheet>
    );
};

export default Overlay;
