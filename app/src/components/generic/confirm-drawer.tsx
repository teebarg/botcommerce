import type React from "react";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";
import { useMediaQuery } from "@/hooks/use-media-query";

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
    const { isMobile } = useMediaQuery()

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
                <DrawerContent aria-describedby={undefined} className="drawer-safe">
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
                                    "w-full py-4 text-center font-semibold text-primary active:bg-primary/10 transition-colors border-b border-border",
                                    variant === "destructive" && "text-destructive active:bg-destructive/10"
                                )}
                            >
                                {isLoading ? "Processing..." : confirmText}
                            </button>
                            <button
                                onClick={onClose}
                                className="w-full py-4 text-center font-medium text-muted-foreground active:bg-secondary transition-colors"
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
                    <DialogFooter className="mt-6 gap-2">
                        <Button
                            onClick={handleCancel}
                            variant="outline" className="text-muted-foreground border-muted"
                        >
                            {cancelText}
                        </Button>
                        <Button
                            isLoading={isLoading}
                            onClick={handleConfirm}
                            variant={variant === "destructive" ? "destructive" : "default"}
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
