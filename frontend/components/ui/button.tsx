import * as React from "react";

import { Spinner } from "../spinner";

import { cn } from "@/lib/util/cn";

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
    sm: "px-4 min-w-20 h-10 text-tiny gap-2 rounded-small",
    md: "px-6 min-w-20 h-12 text-small gap-2 rounded-medium",
    lg: "px-8 min-w-24 h-14 text-medium gap-3 rounded-large",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading?: boolean;
    children: React.ReactNode;
    endContent?: React.ReactNode;
    startContent?: React.ReactNode;
    color?: "primary" | "secondary" | "default" | "danger" | "warning" | "success";
    variant?: "solid" | "bordered" | "flat" | "shadow";
    size?: "sm" | "md" | "lg";
    className?: string;
    style?: React.CSSProperties;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            color = "default",
            variant = "solid",
            size = "sm",
            endContent,
            startContent,
            type = "button", // Default to "button"
            isLoading = false,
            disabled,
            children,
            ...props
        },
        ref
    ) => {
        return (
            <button
                ref={ref}
                className={cn(
                    "z-0 group relative inline-flex items-center justify-center box-border appearance-none select-none whitespace-nowrap",
                    "font-medium overflow-hidden outline-none transition transition-transform-colors-opacity hover:opacity-80",
                    buttonConfig[size],
                    variant === "shadow" && buttonConfig[color].shadow,
                    disabled ? "pointer-events-none opacity-50" : "",
                    buttonConfig[color].color,
                    variant === "bordered" && buttonConfig[color].bordered,
                    className
                )}
                disabled={isLoading || disabled} // Combine isLoading and disabled logic
                type={type} // Explicitly forward the type prop
                {...props}
            >
                {isLoading && <Spinner color="current" />}
                {startContent}
                {children}
                {endContent}
            </button>
        );
    }
);

Button.displayName = "Button";

export { Button };
