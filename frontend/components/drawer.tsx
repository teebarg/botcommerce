"use client";

import React from "react";
import {
    Drawer,
    DrawerTrigger,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerFooter,
    DrawerClose,
} from "@/components/ui/drawer";
import { Drawer as DrawerPrimitive } from "vaul";

interface Props extends Omit<React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Root>, "ref"> {
    // interface Props extends React.ComponentProps<typeof DrawerPrimitive.Root> {
    action?: React.ReactNode;
    children: React.ReactNode;
    direction?: "left" | "right" | "top" | "bottom";
    trigger?: React.ReactNode;
    title?: string | React.ReactNode;
    description?: string | React.ReactNode;
}

const DrawerUI: React.FC<Props> = ({ action, children, direction, trigger, title, description, ...props }) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { fadeFromIndex, ...restProps } = props;
    return (
        <Drawer direction={direction} {...restProps}>
            <DrawerTrigger> {trigger} </DrawerTrigger>
            <DrawerContent direction={direction} className="p-4">
                <DrawerHeader>
                    <DrawerTitle>{title}</DrawerTitle>
                    <DrawerDescription>{description}</DrawerDescription>
                </DrawerHeader>
                {children}
                {action && (
                    <DrawerFooter className="justify-end">
                        <DrawerClose className="border border-input bg-background inline-flex items-center justify-center rounded-md text-sm font-medium focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 h-10 px-8">
                            Cancel
                        </DrawerClose>
                        {action}
                    </DrawerFooter>
                )}
            </DrawerContent>
        </Drawer>
    );
};

export default DrawerUI;
