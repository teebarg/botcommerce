import type React from "react";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/utils";

interface Props {
    content?: string | React.ReactNode;
    onConfirm?: () => void;
    onClose?: () => void;
    trigger: React.ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string | React.ReactNode;
    description?: string | React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    variant?: "default" | "destructive";
    isLoading?: boolean;
    hideActionBtn?: boolean;
}

const ConfirmDrawer: React.FC<Props> = ({
    title = "Confirm?",
    content,
    onConfirm,
    onClose,
    trigger,
    open,
    onOpenChange,
    description,
    confirmText = "Delete",
    cancelText = "Cancel",
    variant = "destructive",
    isLoading = false,
    hideActionBtn = false,
}) => {
    const isMobile = useIsMobile();

    const handleConfirm = async () => {
        onConfirm?.();
    };

    const handleCancel = () => {
        onClose?.();
        onOpenChange(false);
    };

    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={onOpenChange}>
                <DrawerTrigger asChild>{trigger}</DrawerTrigger>
                <DrawerContent aria-describedby={undefined}>
                    <DrawerHeader className="pb-4">
                        <DrawerTitle>{title || "Confirm?"}</DrawerTitle>
                        {description && <DrawerDescription>{description ?? "This action cannot be undone."}</DrawerDescription>}
                    </DrawerHeader>
                    {content}
                    {!hideActionBtn && (
                        <div className="border-t border-border">
                            <button
                                onClick={handleConfirm}
                                className={cn(
                                    "w-full py-4 text-center font-semibold text-primary hover:bg-primary/5 active:bg-primary/10 transition-colors border-b border-border",
                                    variant === "destructive" && "text-destructive hover:bg-destructive/5 active:bg-destructive/10"
                                )}
                            >
                                {isLoading ? "Processing..." : confirmText}
                            </button>
                            <button
                                onClick={onClose}
                                className="w-full py-4 text-center font-medium text-muted-foreground hover:bg-secondary/50 active:bg-secondary transition-colors"
                            >
                                {cancelText}
                            </button>
                        </div>
                    )}
                </DrawerContent>
            </Drawer>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold tracking-tight">{title || "Confirm?"}</DialogTitle>
                    <DialogDescription className="text-sm text-gray-500 mt-1.5">{description ?? "This action cannot be undone."}</DialogDescription>
                </DialogHeader>
                {content}
                {!hideActionBtn && (
                    <DialogFooter className="mt-6 gap-2 sm:gap-2">
                        <Button
                            onClick={handleCancel}
                            className="px-5 border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100"
                        >
                            {cancelText}
                        </Button>
                        <Button
                            isLoading={isLoading}
                            onClick={handleConfirm}
                            className={`px-5 border-none text-white
                            ${
                                variant === "destructive"
                                    ? "bg-gradient-to-br from-[#f85032] to-[#e73827] shadow-[0_4px_6px_-1px_rgba(248,80,50,0.2)] hover:shadow-[0_6px_8px_-1px_rgba(248,80,50,0.3)] hover:-translate-y-px active:translate-y-0"
                                    : "gradient-primary hover:-translate-y-px active:translate-y-0"
                            }
                        `}
                        >
                            {confirmText}
                        </Button>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
};

export { ConfirmDrawer };
