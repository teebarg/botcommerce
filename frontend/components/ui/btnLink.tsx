import * as React from "react";

import { cn } from "@/lib/util/cn";
import LocalizedClientLink from "@/modules/common/components/localized-client-link";

const buttonConfig: any = {
    primary: {
        color: "bg-primary text-primary-foreground",
        shadow: "shadow-lg shadow-primary/40",
        bordered: "bg-transparent border-2 border-primary text-primary hover:bg-primary-500 hover:text-white",
    },
    secondary: {
        color: "bg-secondary text-secondary-foreground",
        shadow: "shadow-lg shadow-secondary/40",
        bordered: "bg-transparent border-2 border-secondary text-secondary hover:bg-secondary-500 hover:text-white",
    },
    default: {
        color: "bg-default text-default-foreground",
        shadow: "shadow-lg shadow-default/40",
        bordered: "bg-transparent border border-default-500 text-default-500 hover:bg-default-500 hover:text-white",
    },
    danger: {
        color: "bg-danger text-danger-foreground",
        shadow: "shadow-lg shadow-danger/40",
        bordered: "bg-transparent border-2 border-danger text-danger hover:bg-danger-500 hover:text-white",
    },
    warning: {
        color: "bg-warning text-warning-foreground",
        shadow: "shadow-lg shadow-warning/40",
        bordered: "bg-transparent border-2 border-warning text-warning hover:bg-warning-500 hover:text-white",
    },
    success: {
        color: "bg-success text-success-foreground",
        shadow: "shadow-lg shadow-success/40",
        bordered: "bg-transparent border-2 border-success text-success hover:bg-success-500 hover:text-white",
    },

    // Sizes
    sm: "px-4 min-w-20 h-10 text-xs gap-2 rounded-lg",
    md: "px-6 min-w-20 h-12 text-sm gap-2 rounded-xl",
    lg: "px-8 min-w-24 h-14 text-base gap-3 rounded-1xl",
};

interface BtnLinkProps {
    children: React.ReactNode;
    color?: "primary" | "secondary" | "default" | "danger" | "warning" | "success";
    variant?: "solid" | "bordered" | "flat" | "shadow";
    size?: "sm" | "md" | "lg";
    className?: string;
    href: string;
}

const BtnLink: React.FC<BtnLinkProps> = ({ size = "sm", color = "primary", variant = "solid", href, className, children, ...props }) => {
    return (
        <LocalizedClientLink
            className={cn(
                "z-0 group relative inline-flex items-center justify-center box-border appearance-none select-none whitespace-nowrap roun",
                "font-medium overflow-hidden outline-none transition-all hover:opacity-80",
                variant === "shadow" && buttonConfig[color].shadow,
                buttonConfig[size],
                buttonConfig[color].color,
                variant === "bordered" && buttonConfig[color].bordered,
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
