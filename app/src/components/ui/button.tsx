"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader } from "lucide-react";
import { cn } from "@/utils";

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    {
        variants: {
            variant: {
                default: "bg-primary text-primary-foreground hover:bg-primary/90",
                destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                outline: "bg-transparent border border-foreground/20 hover:text-secondary-foreground hover:bg-muted/20",
                secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                ghost: "hover:bg-secondary hover:text-secondary-foreground",
                link: "text-primary underline-offset-4 hover:underline",
                accent: "bg-accent text-accent-foreground hover:bg-accent/90",
                "accent-subtle": "bg-accent-subtle text-accent-subtle-foreground hover:bg-accent-subtle/90 border border-accent-subtle-foreground/20",
                success: "bg-success text-success-foreground hover:bg-success/90",
                warning: "bg-warning text-warning-foreground hover:bg-warning/90",
                "warning-subtle": "bg-warning-subtle text-warning-subtle-foreground hover:bg-warning-subtle/90 border border-warning-subtle-foreground/20"
            },
            size: {
                default: "h-10 px-4 py-2 min-w-24",
                xxs: "rounded-lg px-1.5 py-1.5 text-xs",
                xs: "h-7 rounded-md px-2",
                sm: "h-9 rounded-md px-3",
                md: "h-9 rounded-md px-3 min-w-20",
                lg: "h-11 rounded-md px-8 min-w-24",
                xl: "h-14 rounded-2xl px-10 text-lg min-w-24",
                icon: "h-9 w-9 min-w-auto",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
    asChild?: boolean;
    isLoading?: boolean;
    startContent?: React.ReactNode;
    endContent?: React.ReactNode;
    loadingText?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, isLoading = false, children, startContent, endContent, loadingText, ...props }, ref) => {
        const Comp = asChild ? Slot : "button";

        return (
            <Comp
                ref={ref}
                className={cn(
                    buttonVariants({ variant, size }),
                    "relative flex items-center justify-center",
                    isLoading && "opacity-50 cursor-not-allowed", className
                )}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {isLoading ? (
                    <>
                        <Loader className="h-4 w-4 animate-spin" />
                        {size === "icon" ? "" : (loadingText ?? "Pending...")}
                    </>
                ) : (
                    <>
                        {startContent && <span>{startContent}</span>}
                        {children}
                        {endContent && <span>{endContent}</span>}
                    </>
                )}
            </Comp>
        );
    }
);

Button.displayName = "Button";

export { Button, buttonVariants };
