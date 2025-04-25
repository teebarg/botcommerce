"use client";

import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";

import { cn } from "@/lib/util/cn";

const Drawer = ({ shouldScaleBackground = true, ...props }: React.ComponentProps<typeof DrawerPrimitive.Root>) => (
    <DrawerPrimitive.Root shouldScaleBackground={shouldScaleBackground} {...props} />
);

Drawer.displayName = "Drawer";

const DrawerTrigger = DrawerPrimitive.Trigger;

const DrawerPortal = DrawerPrimitive.Portal;

const DrawerClose = DrawerPrimitive.Close;

const DrawerOverlay = React.forwardRef<
    React.ElementRef<typeof DrawerPrimitive.Overlay>,
    React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => <DrawerPrimitive.Overlay ref={ref} className={cn("fixed inset-0 z-50 bg-black/80", className)} {...props} />);

DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName;

// Extend the existing props to include direction
interface DrawerContentProps extends React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content> {
    direction?: "right" | "bottom" | "left" | "top"; // Add your desired directions
}

const DrawerContent = React.forwardRef<React.ElementRef<typeof DrawerPrimitive.Content>, DrawerContentProps>(
    ({ className, children, direction = "bottom", ...props }, ref) => (
        <DrawerPortal>
            <DrawerOverlay />
            <DrawerPrimitive.Content
                ref={ref}
                className={cn(
                    "z-50 fixed flex flex-col mt-2 bg-background border",
                    {
                        "h-full w-auto max-w-4xl right-0 bottom-0": direction === "right",
                        "inset-x-0 h-auto rounded-t-[10px] bottom-0 px-4 max-h-[calc(100vh-50px)]": direction === "bottom",
                        "w-[90vw] sm:w-[25%] bottom-0": direction === "left",
                        "max-w-lg inset-0 m-auto max-h-[50vh] rounded-md after:!h-auto": direction === "top",
                    },
                    className
                )}
                {...props}
            >
                <div className="mx-auto w-[100px] rounded-full bg-muted" />
                {children}
            </DrawerPrimitive.Content>
        </DrawerPortal>
    )
);

DrawerContent.displayName = "DrawerContent";

const DrawerHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("grid gap-1.5 text-centerp text-left", className)} {...props} />
);

DrawerHeader.displayName = "DrawerHeader";

const DrawerFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("mt-auto flex gap-2 p-4", className)} {...props} />
);

DrawerFooter.displayName = "DrawerFooter";

const DrawerTitle = React.forwardRef<React.ElementRef<typeof DrawerPrimitive.Title>, React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>>(
    ({ className, ...props }, ref) => (
        <DrawerPrimitive.Title ref={ref} className={cn("text-lg font-semibold leading-none tracking-tight py-4", className)} {...props} />
    )
);

DrawerTitle.displayName = DrawerPrimitive.Title.displayName;

const DrawerDescription = React.forwardRef<
    React.ElementRef<typeof DrawerPrimitive.Description>,
    React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({ className, ...props }, ref) => <DrawerPrimitive.Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />);

DrawerDescription.displayName = DrawerPrimitive.Description.displayName;

export { Drawer, DrawerPortal, DrawerOverlay, DrawerTrigger, DrawerClose, DrawerContent, DrawerHeader, DrawerFooter, DrawerTitle, DrawerDescription };
