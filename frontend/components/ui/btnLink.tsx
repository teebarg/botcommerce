"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import LocalizedClientLink from "@/components/ui/link";
import { buttonVariants } from "@/components/ui/button";

interface BtnLinkProps {
    children: React.ReactNode;
    variant?: "primary" | "secondary" | "default" | "destructive" | "warning" | "success" | "emerald" | "bordered" | "borderedSecondary";
    size?: "sm" | "lg" | "icon" | "iconOnly";
    className?: string;
    href: string;
}

const BtnLink: React.FC<BtnLinkProps> = ({ size = "sm", variant = "primary", href, className, children, ...props }) => {
    return (
        <LocalizedClientLink
            className={cn(
                buttonVariants({
                    variant: variant,
                    size,
                }),
                "z-0 group relative inline-flex items-center justify-center whitespace-nowrap",
                "font-medium overflow-hidden outline-none transition-all hover:opacity-80",
                className
            )}
            href={href}
            {...props}
        >
            {children}
        </LocalizedClientLink>
    );
};

BtnLink.displayName = "BtnLink";

export { BtnLink };
