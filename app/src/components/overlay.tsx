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
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetTrigger asChild>{trigger}</SheetTrigger>
            <SheetContent className={cn("w-full sm:max-w-lg p-0 flex flex-col bg-card border-border", sheetClassName)}>
                <SheetHeader className={showHeader ? "p-6 pb-0" : "sr-only"}>
                    <SheetTitle className="flex items-center gap-3 text-xl">{title}</SheetTitle>
                </SheetHeader>
                <AnimatePresence mode="wait">{children}</AnimatePresence>
            </SheetContent>
        </Sheet>
    );

    // if (isDesktop) {
    //     return (
    //         <Sheet open={open} onOpenChange={onOpenChange}>
    //             <SheetTrigger asChild>{trigger}</SheetTrigger>
    //             <SheetContent aria-describedby={undefined} className={sheetClassName}>
    //                 <SheetHeader className={showHeader ? "" : "sr-only"}>
    //                     <SheetTitle>{title}</SheetTitle>
    //                 </SheetHeader>
    //                 <div className="overflow-y-auto">{children}</div>
    //             </SheetContent>
    //         </Sheet>
    //     );
    // }

    // return (
    //     <Dialog open={open} onOpenChange={onOpenChange}>
    //         <DialogTrigger asChild>{trigger}</DialogTrigger>
    //         <DialogContent className={cn(isIOS && "pb-[env(safe-area-inset-bottom)]")} size="full">
    //             <div className="overflow-y-auto">{children}</div>
    //         </DialogContent>
    //     </Dialog>
    // );
};

export default Overlay;
